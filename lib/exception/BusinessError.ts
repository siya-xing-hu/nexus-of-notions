import { ErrorObj } from "@/lib/api";

/**
 * 自定义业务错误类
 */
export class BusinessError extends Error {
  public errorCode: number;

  constructor(message: string, errorCode: number = 400) {
    super(message);
    this.name = "BusinessError";
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
   * 参数错误
   */
  static required(message: string): BusinessError {
    return new BusinessError(message, 400);
  }

  /**
   * 方法不允许错误
   */
  static methodNotAllowed(): BusinessError {
    return new BusinessError("方法不允许", 405);
  }
}
