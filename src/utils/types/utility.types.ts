export type TDictionary<T = any> = Record<string, T>;

/**
 * Служит для удаления не описанных параметров из интерфейса
 * @example
 * type TypeA = {
 *   a: string;
 *   [key: string]: string;
 * }
 *
 * type TypeB = RemoveIndex<TypeA>
 *
 * TypeB = {
 *   a: string
 * }
 */
export type TRemoveIndex<T> = {
  [P in keyof T as string extends P
    ? never
    : number extends P
    ? never
    : P]: T[P];
};

// eslint-disable-next-line im/naming-interfaces-and-types
export type valueof<T> = T[keyof T];

/**
 * Создание брендированного типа
 */
export type TBrand<T, B extends string> = T & { readonly _brand: B };

export type TNullable<T> = T | null | undefined;

export type TNonNullableDeep<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
} & NonNullable<T>;
