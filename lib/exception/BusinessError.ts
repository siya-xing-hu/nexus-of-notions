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
   * 无效请求错误
   */
  static invalidRequest(message: string): BusinessError {
    return new BusinessError(message, 400);
  }

  /**
   * 参数错误
   */
  static required(message: string): BusinessError {
    return new BusinessError(message, 400);
  }


  /**
   * 未授权错误
   */
  static unauthorized(message: string): BusinessError {
    return new BusinessError(message, 401);
  }

  /**
   * 未找到错误
   */
  static notFound(message: string): BusinessError {
    return new BusinessError(message, 404);
  }

  /**
   * 方法不允许错误
   */
  static methodNotAllowed(): BusinessError {
    return new BusinessError("方法不允许", 405);
  }
}
