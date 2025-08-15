import { addWeightRecord } from "@/lib/db";
import { BusinessError } from "../exception/BusinessError";

export class WeightHandler {
  /**
   * 处理添加体重记录的请求
   */
  static async handleAddWeight(
    weight: number,
    date: string,
    userId: string,
  ): Promise<void> {
    // 验证用户ID
    if (!userId) {
      throw BusinessError.required("用户ID是必需的");
    }

    // 验证体重参数
    if (!weight || typeof weight !== "number") {
      throw BusinessError.required("体重参数是必需的且必须是数字");
    }

    // 体重必须在 30-200 kg 之间
    if (weight < 30 || weight > 200) {
      throw BusinessError.required("体重必须在 30-200 kg 之间");
    }

    // 添加体重记录
    await addWeightRecord(userId, weight, date);
  }
}
