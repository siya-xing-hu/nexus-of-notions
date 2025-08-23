import { BusinessError } from "../exception/BusinessError";
import { Telegram, TelegramMessage } from "../telegram";

export interface SearchResult {
  message: TelegramMessage | null;
  channel: string;
  sentMessageId: number;
  keyword: string;
}

export class SearchHandler {
  static async handleSearch(
    channel: string,
    keyword: string,
  ): Promise<SearchResult> {
    // 验证关键字
    if (!keyword) {
      throw BusinessError.required("关键字是必需的");
    }
    // 验证频道
    if (!channel) {
      throw BusinessError.required("频道是必需的");
    }

    const sentMessageId = await Telegram.getService().sendMessage(
      channel,
      keyword,
    );

    let message: TelegramMessage | null = null;
    // 等待 1 秒, 轮询 3 次，直到获取到匹配到的消息
    for (let i = 0; i < 3; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message = await SearchHandler.getMessage(
        channel,
        sentMessageId,
        keyword,
        5,
      );
      if (message) {
        break;
      }
    }

    return {
      message,
      channel,
      sentMessageId,
      keyword,
    };
  }

  static async getMessage(
    channel: string,
    sentMessageId: number,
    keyword: string,
    limit: number = 20,
  ): Promise<TelegramMessage | null> {
    const messages = await Telegram.getService().getChannelMessages(
      channel,
      limit,
    );
    return await SearchHandler.getReplyMessage(
      messages,
      sentMessageId,
      keyword,
    );
  }

  private static async getReplyMessage(
    messages: TelegramMessage[],
    sentMessageId: number,
    keyword: string,
  ): Promise<TelegramMessage | null> {
    if (messages.length === 0) {
      return null;
    }

    for (const message of messages) {
      if (message.replyTo === sentMessageId) {
        return message;
      }
      if (
        message.id != sentMessageId &&
        message.rawText?.includes(keyword.split(" ")[1] ?? keyword)
      ) {
        return message;
      }
    }

    return null;
  }
}
