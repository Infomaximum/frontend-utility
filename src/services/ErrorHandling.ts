import type { ErrorInfo } from "react";

export type TRegisterTaskParams = {
  code: string;
  name: string;
  message: string;
  errorInfo?: ErrorInfo;
  path: string;
};

class ErrorHandling {
  /**
   * Регистрирует ошибку, отправляя ее на сервер для логирования
   */
  public registerError(_params: TRegisterTaskParams) {
    //const { message, name, path, code } = params;
    // todo: Реализовать отправку ошибки, после реализации на сервере
  }
}

export default ErrorHandling;
