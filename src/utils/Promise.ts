export type TPromiseControls = {
  resolve(result?: any): void;
  reject(e?: any): void;
};
export interface IDeferred<T = any> {
  promise: Promise<T>;
  resolve(result?: T): void;
  reject(e?: any): void;
  then(onResolve: (param: any) => any, onReject?: (e: any) => any): Deferred;
  catch(onRejected: (e: any) => any): Deferred;
  finally(onFinally: () => void): Deferred;
}
export interface IPromiseSource {
  resolve: ((param?: any) => any)[];
  reject: ((e?: any) => any)[];
  resolver(param: any): any;
  then(onResolve: (param: any) => any, onReject?: (e: any) => any): any;
  thenMutate(mutation: (param: any) => any): any;
  catch(onReject: (e: any) => any): any;
}

export const promised = function <T = unknown>(func: any) {
  return new Promise<T>((resolve, reject) => {
    func({ reject, resolve });
  });
};

export const deferred = function (func: (promiseControls: Deferred) => void) {
  const deferred = new Deferred();

  func(deferred);

  return deferred;
};

export class Deferred implements IDeferred {
  public static resolve(result?: any) {
    const deferred = new Deferred();

    deferred.resolve(result);

    return deferred;
  }

  public static reject(result?: any) {
    const deferred = new Deferred();

    deferred.reject(result);

    return deferred;
  }

  public promise: Promise<any>;
  public reject!: (reason?: any) => void;
  public resolve!: (value?: any) => void;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.reject = reject;
      this.resolve = resolve;
    });
  }

  public then<T = any>(
    onResolve: (param: any) => any,
    onReject?: (e: any) => any
  ): IDeferred<T> {
    this.promise = this.promise.then(onResolve, onReject);
    return this;
  }

  public catch<T = any>(onRejected: (e: any) => any): IDeferred<T> {
    this.promise = this.promise.catch(onRejected);
    return this;
  }

  public finally<T = any>(onFinally: () => void): IDeferred<T> {
    this.promise = this.promise.finally(onFinally);

    return this;
  }
}

/**
 * Реализует thenable интерфейс для работы с Promise, его имитации и сбора обработчиков для
 * дальнейшей их передачи @class PromiseSource
 */
export class PromiseSource implements IPromiseSource {
  public resolver: (param: any) => any;

  public additionalMutates: ((...args: any[]) => any)[] = [];

  public resolve: IPromiseSource["resolve"] = [];

  public reject: IPromiseSource["reject"] = [];

  /**
   * @param {Function} resolver
   * @returns {PromiseSource}
   */
  constructor(resolver: (param: any) => any) {
    if (process.env.NODE_ENV !== "production") {
      if (!resolver) {
        throw new Error("Requires a Promise resolver");
      }
      if (typeof resolver !== "function") {
        throw new Error(
          `Promise resolver must be a function, but it's value is "${typeof resolver}"`
        );
      }
    }

    this.resolver = resolver;

    return this;
  }

  /**
   * @param {Function} [onResolve]
   * @param {Function} [onReject]
   * @returns {PromiseSource}
   */
  public then(onResolve: (param: any) => any, onReject?: (e: any) => any) {
    if (process.env.NODE_ENV !== "production") {
      if (!(onResolve || onReject)) {
        throw new Error("Requires at least one handler");
      }
      if (onResolve) {
        if (typeof onResolve !== "function") {
          throw new Error(
            `Then handler must be a function, but it's value is "${typeof onResolve}"`
          );
        }
        this.resolve.push(onResolve);
      }
      if (onReject) {
        if (typeof onReject !== "function") {
          throw new Error(
            `Catch handler must be a function, but it's value is "${typeof onReject}"`
          );
        }
        this.reject.push(onReject);
      }
    } else {
      if (onResolve) {
        this.resolve.push(onResolve);
      }
      if (onReject) {
        this.reject.push(onReject);
      }
    }

    return this;
  }

  /**
   * @param {Function} mutation
   * @returns {PromiseSource}
   */
  public thenMutate(mutation: (param: any) => any) {
    if (process.env.NODE_ENV !== "production") {
      if (!mutation) {
        throw new Error("Requires a mutation");
      }
      if (typeof mutation !== "function") {
        throw new Error(
          `Mutation must be a function, but it's value is "${typeof mutation}"`
        );
      }
    }

    this.additionalMutates.push(mutation);

    return this;
  }

  /**
   * @param {Function} onReject
   * @returns {PromiseSource}
   */
  public catch(onReject: (e: any) => any) {
    if (process.env.NODE_ENV !== "production") {
      if (!onReject) {
        throw new Error("Requires a catch handler");
      }
      if (typeof onReject !== "function") {
        throw new Error(
          `Catch handler must be a function, but it's value is "${typeof onReject}"`
        );
      }
    }
    this.reject.push(onReject);

    return this;
  }
}
