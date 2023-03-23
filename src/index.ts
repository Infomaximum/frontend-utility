import type { TPromiseControls, IDeferred } from "./utils/Promise";
import { Deferred, promised, deferred } from "./utils/Promise";
import {
  requireAllUnique,
  requireAll,
  requireAllModels,
} from "./utils/Resolve";
import {
  GraphQlQuery,
  enumValue,
  EnumValue,
  type gql,
} from "./utils/graphqlQueryBuilder";
import type { TPropInjector } from "./utils/types/PropInjector";
import { cookies } from "./utils/Auth/Auth";
import type {
  TFeatureChecker,
  TFeatureCacheKeyCreator,
} from "./services/Feature";
import Feature from "./services/Feature";
import userAgent from "./utils/userAgent";
import ErrorHandling from "./services/ErrorHandling";
import { formatTime } from "./utils/Format/Format";
import { momentLocaleUpdate } from "./utils/moment";
import type {
  IDocumentNode,
  TInferredVariables,
} from "./utils/graphql/graphqlTag";
import { graphqlTag } from "./utils/graphql/graphqlTag";
import { TestIdsUtils } from "./const/TestIds";

export * from "./const";
export * from "./const/utilsLoc";

export * from "./utils/Access";
export * from "./utils/Algorithms";
export * from "./utils/Date/Date";
export * from "./managers/TaskManager";
export * from "./utils/Validators/Validators";

export {
  ErrorHandling,
  Deferred,
  requireAllUnique,
  requireAll,
  requireAllModels,
  GraphQlQuery,
  promised,
  deferred,
  enumValue,
  cookies,
  Feature,
  userAgent,
  EnumValue,
  formatTime,
  momentLocaleUpdate,
  graphqlTag,
  TestIdsUtils,
};

export type {
  gql,
  TPromiseControls,
  IDeferred,
  TFeatureChecker,
  TFeatureCacheKeyCreator,
  TPropInjector,
  IDocumentNode,
  TInferredVariables,
};
