import reduce from "lodash/reduce";
import some from "lodash/some";
import every from "lodash/every";

/**
 * Список всех возможных операций по всем привилегиям системы
 */
export enum EOperationType {
  READ = "READ",
  DELETE = "DELETE",
  CREATE = "CREATE",
  WRITE = "WRITE",
  EXECUTE = "EXECUTE",
  ALL = "ALL",
}

export interface IFeatureAdditionalProps {
  accessType?: EOperationType;
  exact?: boolean;
}

export type TFeatureEnabledChecker = <T extends IFeatureAdditionalProps>(
  key: string,
  additionalProps?: T
) => boolean;

export type TAccess = {
  hasReadAccess: boolean;
  hasWriteAccess: boolean;
  hasCreateAccess: boolean;
  hasDeleteAccess: boolean;
  hasExecuteAccess: boolean;
};

const featureAdditionalProps: {
  [K in keyof TAccess]: IFeatureAdditionalProps;
} = {
  hasReadAccess: {
    accessType: EOperationType.READ,
  },
  hasWriteAccess: {
    accessType: EOperationType.WRITE,
  },
  hasCreateAccess: {
    accessType: EOperationType.CREATE,
  },
  hasDeleteAccess: {
    accessType: EOperationType.DELETE,
  },
  hasExecuteAccess: {
    accessType: EOperationType.EXECUTE,
  },
};

export const getAccessParameters = (
  isFeatureEnabled?: TFeatureEnabledChecker,
  accessKeys?: string[],
  someAccessKeys?: string[]
): TAccess => {
  const initialAccess: TAccess = {
    hasReadAccess: true,
    hasWriteAccess: true,
    hasCreateAccess: true,
    hasDeleteAccess: true,
    hasExecuteAccess: true,
  };

  if (!isFeatureEnabled) {
    return initialAccess;
  }

  return reduce(
    featureAdditionalProps,
    (access, additionalProps, additionalPropsKey) => {
      const accessChecker = (accessKey: string): boolean =>
        isFeatureEnabled(accessKey, additionalProps);

      return (!accessKeys ||
        (accessKeys && every(accessKeys, accessChecker))) &&
        (!someAccessKeys ||
          (someAccessKeys && some(someAccessKeys, accessChecker)))
        ? access
        : { ...access, [additionalPropsKey]: false };
    },
    initialAccess
  );
};

/** Константа для назначения доступа только на чтение */
export const readOnlyAccess = {
  hasReadAccess: true,
  hasWriteAccess: false,
  hasCreateAccess: false,
  hasDeleteAccess: false,
  hasExecuteAccess: false,
};
