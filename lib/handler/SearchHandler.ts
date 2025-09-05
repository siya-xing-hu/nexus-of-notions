import { BusinessError } from "../exception/BusinessError";
import { Telegram, TelegramMessage } from "../telegram";

export interface SearchResult {
  message: TelegramMessage | null;
  channel_id: string;
  sentMessageId: number;
  keyword: string;
}

export class SearchHandler {
  private static SEARCH_CHANNEL = [
    {
      id: "1",
      name: "网盘资源讨论区",
      username: "yunpanchat",
      search_code: "/s ",
    },
    {
      id: "2",
      name: "阿里云盘 投稿&搜索",
      username: "yunpan_bot",
      search_code: "/s ",
    },
  ];

  private static userId = "a479546b-bec8-42d4-8ad0-c10e8202cb4a";

  static async handleSearch(
    channel_id: string,
    keyword: string,
  ): Promise<SearchResult> {
    // 验证关键字
    if (!keyword) {
      throw BusinessError.required("关键字是必需的");
    }
    // 验证频道
    // 在 SEARCH_CHANNEL 中查找与 channel_id 匹配的频道
    const channel = SearchHandler.SEARCH_CHANNEL.find((c) => c.id === channel_id);
    if (!channel) {
      throw BusinessError.required("频道错误");
    }

    const service = await Telegram.getService(SearchHandler.userId);
    const sentMessageId = await service.sendMessage(
      channel.username,
      channel.search_code + keyword,
    );

    let message: TelegramMessage | null = null;
    // 等待 1 秒, 轮询 3 次，直到获取到匹配到的消息
    for (let i = 0; i < 3; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message = await SearchHandler.getMessage(
        channel.id,
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
      channel_id,
      sentMessageId,
      keyword,
    };
  }

  static async getMessage(
    channel_id: string,
    sentMessageId: number,
    keyword: string,
    limit: number = 20,
  ): Promise<TelegramMessage | null> {
    const channel = SearchHandler.SEARCH_CHANNEL.find((c) => c.id === channel_id);
    if (!channel) {
      throw BusinessError.required("频道错误");
    }
    const service = await Telegram.getService(SearchHandler.userId);
    const messages = await service.getChannelMessages(
      channel.username,
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
