import isFunction from "lodash/isFunction";
import { assertSimple } from "@infomaximum/assert";
import type { TDictionary } from "../utils/types/utility.types";

/**
 * Название функционала
 * @typedef {string} TFeatureName
 */
export type TFeatureName = string;

/**
 * Ключ привилегии функционала
 * @typedef {string} TPrivilegeKey
 */
export type TPrivilegeKey = string;

/**
 * Описание функционала
 * @typedef {Object<string>} TFeatureDescription
 */
export type TFeatureDescription = {
  name: TFeatureName;
  privilegeKey?: TPrivilegeKey;
  getValue?: (user: any) => boolean;
  priority?: number;
};

/**
 * Функция возвращающая состояние функционала (включена/отключена)
 * @typedef {function(key: string, props: *, additionalProps: *):boolean} TFeatureChecker
 */
export type TFeatureChecker<P, A> = (
  key: string,
  props: P,
  additionalProps: A
) => boolean;

/**
 * Генерирует ключ кэша для дополнительных параметров
 * @typedef {function(additionalProps: *):string} TFeatureCacheKeyCreator
 */
export type TFeatureCacheKeyCreator<A> = (additionalProps: A) => string;

/**
 * Хранит в себе список доступного функционала по работе с системой для текущего пользователя
 * @typedef {Object} IFeature
 */
class Feature<
  P extends TDictionary = TDictionary<unknown>,
  A extends TDictionary = TDictionary<unknown>
> {
  protected features: TDictionary<TFeatureChecker<P, A>> = {};
  protected defaultChecker: TFeatureChecker<P, A>;
  protected cacheKeyCreator: TFeatureCacheKeyCreator<A>;
  protected props: P = {} as P;
  protected cache: TDictionary<boolean> = {};

  constructor(
    defaultChecker: TFeatureChecker<P, A>,
    cacheKeyCreator: TFeatureCacheKeyCreator<A>
  ) {
    this.defaultChecker = defaultChecker;
    this.cacheKeyCreator = cacheKeyCreator;
  }

  /**
   * Задаёт параметры для чекеров
   * @param {Object<*>} props
   */
  public updateProps(props: P): void {
    this.props = props;
    this.cache = {};
  }

  /**
   * Добавляет чекер для функционала
   * @param {string} key - ключ, по которому можно получить значение
   * @param {Function} checker - функция проверки
   */
  public addCheck(key: string, checker: TFeatureChecker<P, A>): void {
    this.features[key] = checker;
  }

  /**
   * Удаляет чекер какого-либо функционала
   * @param {string} key - ключ, по которому был добавлен удаляемый чекер
   */
  public removeCheck(key: string): void {
    delete this.features[key];
  }

  /**
   * Функция проверки доступности функционала
   * @param {string} key - ключ функционала, который необходимо проверить
   * @param {Object<*>} additionalProps - дополнительные параметры, которые надо передать в чекер
   * @returns {boolean} статус доступности функционала
   */
  public isEnabled(key: string, additionalProps: A = {} as A): boolean {
    assertSimple(!!this.props, `Параметры для чекеров не заданы!`);
    const cacheKey: string = key + this.cacheKeyCreator(additionalProps);

    if (!(cacheKey in this.cache)) {
      const checker: TFeatureChecker<P, A> | undefined = this.features[key]
        ? this.features[key]
        : this.defaultChecker;

      if (isFunction(checker)) {
        this.cache[cacheKey] = checker(key, this.props, additionalProps);
      }
    }

    return this.cache?.[cacheKey] ?? false;
  }
}

export default Feature;
