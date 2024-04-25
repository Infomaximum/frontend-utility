import { assertSimple } from "@infomaximum/assert";
import type { TDictionary } from "./types/utility.types";

/**
 * Оригинальный репозиторий: https://github.com/wix/graphql-query-builder
 */
export declare namespace gql {
  export interface IGraphQlQueryFactory {
    new (fnName: string | IAlias, argumentsMap?: IArgumentsMap): GraphQlQuery;
  }

  export interface IArgumentsMap {
    [index: string]: string | number | boolean | EnumValue | unknown;
  }

  export interface IAlias {
    [index: string]: string | GraphQlQuery;
  }

  export interface IHead {
    fnName: IAlias;
    argumentsMap?: IArgumentsMap;
  }

  export interface IBody {
    attr: IAlias;
    argumentsMap?: IArgumentsMap;
  }

  export interface ISelection extends Partial<IArgumentsMap> {
    _filter?: Record<string, unknown>;
  }
}

export class GraphQlQuery {
  public head: gql.IHead;
  public body: (gql.IBody | GraphQlQuery)[];
  public isContainer: boolean;
  public isWithoutBody: boolean;

  constructor(
    fnName: string | gql.IAlias,
    argumentsMap: gql.IArgumentsMap = {},
  ) {
    this.head =
      typeof fnName === "string"
        ? { fnName: { [fnName]: fnName } }
        : { fnName };
    this.head.argumentsMap = argumentsMap;
    this.body = [];
    this.isContainer = false;
    this.isWithoutBody = false;
  }

  public select(
    ...selects: (string | gql.ISelection | GraphQlQuery)[]
  ): GraphQlQuery {
    if (this.isContainer) {
      throw new Error("Can`t use selection on joined query.");
    }

    this.body = this.body.concat(
      selects.map((item) => {
        let selection: any = {};

        if (typeof item === "string") {
          selection.attr = { [item]: item };
          selection.argumentsMap = {};
        } else if (item instanceof GraphQlQuery) {
          selection = item;
        } else if (typeof item === "object") {
          selection.argumentsMap = (item._filter as gql.IArgumentsMap) || {};
          delete item._filter;
          selection.attr = item as gql.IAlias;
        }

        return selection;
      }),
    );
    return this;
  }

  public filter(argumentsMap: gql.IArgumentsMap): GraphQlQuery {
    for (const key in argumentsMap) {
      if (argumentsMap.hasOwnProperty(key) && this.head.argumentsMap?.[key]) {
        this.head.argumentsMap[key] = argumentsMap[key];
      }
    }

    return this;
  }

  public join(...queries: GraphQlQuery[]): GraphQlQuery {
    const combined = new GraphQlQuery("");
    combined.isContainer = true;
    combined.body.push(this);
    combined.body = combined.body.concat(queries);

    return combined;
  }

  public withoutBody(): GraphQlQuery {
    if (this.isContainer) {
      throw new Error("Can`t use withoutBody on joined query.");
    }

    this.isWithoutBody = true;
    return this;
  }

  public toString() {
    if (this.isContainer) {
      return `{ ${this.buildBody()} }`;
    }
    if (this.isWithoutBody) {
      return `{ ${this.buildHeader()} }`;
    }
    return `{ ${this.buildHeader()}{${this.buildBody()}} }`;
  }

  public buildHeader(): string {
    return (
      this.buildAlias(this.head.fnName) +
      this.buildArguments(this.head.argumentsMap)
    );
  }

  /** Создает аргументы для запроса/мутации */
  public buildArguments(argumentsMap: gql.IArgumentsMap | undefined): string {
    const query = this.objectToString(argumentsMap);

    return query ? `(${query})` : "";
  }

  public getGraphQLValue(value: any): string {
    if (Array.isArray(value)) {
      const arrayString = value
        .map((item) => {
          return this.getGraphQLValue(item);
        })
        .join();

      return `[${arrayString}]`;
    }
    if (value instanceof EnumValue) {
      return value.toString();
    }
    if (value && "object" === typeof value) {
      return `{${this.objectToString(value)}}`;
    }
    return JSON.stringify(value);
  }

  public objectToString(obj: TDictionary | undefined): string {
    return obj
      ? Object.keys(obj)
          .map((key) => `${key}: ${this.getGraphQLValue(obj[key])}`)
          .join(", ")
      : "";
  }

  public buildAlias(attr: gql.IAlias): string {
    const alias = Object.keys(attr)[0];
    assertSimple(!!alias, "Передан пустой объект");

    const query = attr[alias];

    assertSimple(!!query, "Ошибка формирования query");

    let value = this.prepareAsInnerQuery(query);

    value = alias !== value ? `${alias}: ${value}` : value;
    return value;
  }

  public buildBody(): string {
    return this.body
      .map((item: gql.IBody | GraphQlQuery) => {
        if (item instanceof GraphQlQuery) {
          return this.prepareAsInnerQuery(item);
        }

        return (
          this.buildAlias(item.attr) + this.buildArguments(item.argumentsMap)
        );
      })
      .join(" ");
  }

  /** Убирает из переданного { query } крайние фигурные скобки */
  public prepareAsInnerQuery(query: string | GraphQlQuery): string {
    let ret = "";
    if (query instanceof GraphQlQuery) {
      ret = query.toString();
      ret = ret.substring(2, ret.length - 2);
    } else {
      ret = query.toString();
    }
    return ret;
  }
}

export class EnumValue {
  private value: string;

  constructor(value: string) {
    this.value = value;
  }

  public toString(): string {
    return this.value;
  }
}

export function enumValue(value: string): EnumValue {
  return new EnumValue(value);
}
