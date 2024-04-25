import isNumber from "lodash/isNumber";
import includes from "lodash/includes";
import isUndefined from "lodash/isUndefined";
import forEach from "lodash/forEach";
import { type DocumentNode, parse } from "graphql/language";
import { assertSimple } from "@infomaximum/assert";
import { GraphQlQuery } from "../utils/graphqlQueryBuilder";

type TFormData<T> = { initial: T[]; current: T[] };

type TQueue<T> = {
  data: T;
};

export type TQueryConfig<T> = {
  mutationPath: string[];
  getCreateMutation: (data: T, index: number) => GraphQlQuery | undefined;
  getUpdateMutation: (data: T, index: number) => GraphQlQuery | undefined;
  getRemoveMutation: (ids: number[]) => GraphQlQuery | undefined;
};

/**
 * Этот менеджер задач был написан для компонента ArrayField. Его задача состоит в том, что
 * бы поддержать все привилегии доступа для компонента и генерировать запросы для каждого типа
 * операции CRUD. Для правильной работы каждое поле должно содержать id, которое приходит с сервера
 */
export class TaskManager<T extends { id?: number; [key: string]: any }> {
  private queueCreate: Map<number, TQueue<T>> = new Map<number, TQueue<T>>();
  private queueUpdate: Map<number, TQueue<T>> = new Map<number, TQueue<T>>();
  private queueRemove: Map<number, TQueue<T>> = new Map<number, TQueue<T>>();

  /**
   * Метод для построения очереди заданий
   * @param formData - values и initialValues из react-final-form
   */
  public createTaskQueue(formData: TFormData<T>): void {
    const { current, initial } = formData;
    const ids: (number | string)[] = [];

    forEach(current, (field, index) => {
      /**
       * Все поля, которые не имеют поля id, помечаются, как созданные
       */
      if (isUndefined(field.id)) {
        this.queueCreate.set(index, {
          data: field as T,
        });
        return;
      } else {
        ids.push(field.id);
      }

      forEach(initial, (initField) => {
        forEach(Object.keys(initField), (j) => {
          if (
            j !== "id" &&
            !isUndefined(field.id) &&
            initField.id === field.id &&
            initField[j] !== field[j]
          ) {
            if (isNumber(initField?.id) && !Number.isNaN(initField?.id)) {
              this.queueUpdate.set(initField.id, {
                data: field as T,
              });
            }
            return;
          }
        });
      });
    });

    if (ids.length !== initial.length) {
      forEach(initial, (initField) => {
        if (!includes(ids, initField.id) && isNumber(initField.id)) {
          this.queueRemove.set(initField.id, {
            data: {
              id: initField.id,
            } as T,
          });

          this.queueUpdate.delete(initField.id);
        }
      });
    }
  }

  /**
   * Очистка очереди заданий.
   */
  public resetQueue(): void {
    this.queueCreate.clear();
    this.queueUpdate.clear();
    this.queueRemove.clear();
  }

  private parseQuery(queryAsString: string): DocumentNode {
    let result;

    try {
      result = parse(queryAsString);
    } catch (error) {
      throw new Error("Mutation is not valid");
    }

    return result;
  }

  private getQueryWithNesting(
    queryPath: string[],
    createMutations: GraphQlQuery[],
    updateMutations: GraphQlQuery[],
    removeMutations: GraphQlQuery[],
  ): string {
    const sizeOfNesting = queryPath.length - 1;

    const graphqlQueryName = queryPath[sizeOfNesting];

    assertSimple(!!graphqlQueryName, "Отсутствует query");

    let query = new GraphQlQuery(graphqlQueryName).select(
      new GraphQlQuery("")
        .withoutBody()
        .join(...removeMutations)
        .join(...createMutations)
        .join(...updateMutations),
    );

    for (let i = sizeOfNesting - 1; i >= 0; i--) {
      const graphqlQueryName = queryPath[i];

      if (graphqlQueryName) {
        query = new GraphQlQuery(graphqlQueryName).select(query);
      }
    }

    return query.toString();
  }

  /**
   * Метод для построения запроса исходя из очереди заданий.
   * @param queryConfig- Конфигурация запроса. Должна содержать путь до мутации и три метода,
   * которые возвращают саму мутацию под каждый тип CRUD операции.
   */
  public getQuery(queryConfig: TQueryConfig<T>): DocumentNode {
    const {
      mutationPath,
      getCreateMutation,
      getRemoveMutation,
      getUpdateMutation,
    } = queryConfig;

    const createMutations: GraphQlQuery[] = [];
    const updateMutations: GraphQlQuery[] = [];
    const removeMutations: GraphQlQuery[] = [];
    const removeIds: number[] = [];

    this.queueUpdate.forEach((item, key) => {
      const updateMutation = getUpdateMutation(item.data, key);

      if (updateMutation) {
        updateMutations.push(updateMutation);
      }
    });

    this.queueCreate.forEach((item, key) => {
      const createMutation = getCreateMutation(item.data, key);

      if (createMutation) {
        createMutations.push(createMutation);
      }
    });

    this.queueRemove.forEach((item) => {
      if (isNumber(item.data.id)) {
        removeIds.push(item.data.id);
      }
    });

    if (removeIds.length) {
      const removeMutation = getRemoveMutation(removeIds);

      if (removeMutation) {
        removeMutations.push(removeMutation);
      }
    }

    return this.parseQuery(
      `mutation ${this.getQueryWithNesting(
        mutationPath,
        createMutations.filter(Boolean),
        updateMutations.filter(Boolean),
        removeMutations.filter(Boolean),
      )}`,
    );
  }
}
