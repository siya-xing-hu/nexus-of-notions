import { ErrorObj } from "@/lib/api";

/**
 * 自定义业务错误类
 */
export class SystemError extends Error {
  public errorCode: number;

  constructor(message: string, errorCode: number = 500) {
    super(message);
    this.name = "SystemError";
    this.errorCode = errorCode;
  }

  /**
   * 转换为 API 错误对象
   */
  toErrorObj(): ErrorObj {
    return {
      errorCode: this.errorCode,
      message: this.message,
    };
  }

  /**
   * 系统错误
   */
  static internalServerError(): SystemError {
    return new SystemError("服务器内部错误", 500);
  }
}
