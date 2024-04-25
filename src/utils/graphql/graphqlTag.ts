import type { DocumentNode } from "graphql";
import gqt from "graphql-tag";
import type { TDictionary } from "../types/utility.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface IDocumentNode<_Variables extends TDictionary = never>
  extends DocumentNode {}

export type TInferredVariables<
  T extends { [P in K]: IDocumentNode<TDictionary> },
  K extends keyof T,
> = Pick<T, K> extends IDocumentNode<infer V> ? V : TDictionary;

export const graphqlTag = <Variables extends TDictionary = never>(
  literals: ReadonlyArray<string> | Readonly<string>,
  ...placeholders: any[]
): IDocumentNode<Variables> => gqt(literals, ...placeholders);
