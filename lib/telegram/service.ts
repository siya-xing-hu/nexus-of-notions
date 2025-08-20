import { randomUUID } from "crypto";
import { Telegram } from ".";
import { DbTelegramChannel } from "../db/types";
import { ChannelType } from "@prisma/client";
import { BusinessError } from "../exception";
import { TelegramClient } from "./client";

export interface TelegramMessage {
  id: number;
  date: string;
  text: string;
  rawText?: string;
  views?: number;
  from?: any;
  replyTo?: number | null;
  replyContent?: {
    id: number;
    text: string | null;
    fullText: string | null;
  } | null;
  links?: Array<{ text: string; url: string }>;
  hasReplies?: boolean;
  replyCount?: number;
}

export class TelegramService {
  private client: TelegramClient;

  constructor(client: TelegramClient) {
    this.client = client;
  }

  private async getBaseChannelInfo(channelUsername: string): Promise<DbTelegramChannel> {
    try {
      const cleanUsername = channelUsername.replace("@", "");

      const resolvedPeer = await this.client.call<any>(
        "contacts.resolveUsername",
        {
          username: cleanUsername,
        },
      );

      // 根据 peer 类型确定用户类型
      let type: ChannelType = ChannelType.CHANNEL;
      let channel: any = null;

      if (resolvedPeer.peer._ === "peerChannel") {
        type = ChannelType.CHANNEL;
        channel = resolvedPeer.chats?.find((chat: any) => chat.username === cleanUsername);
      } else if (resolvedPeer.peer._ === "peerUser") {
        // 需要进一步检查是否是机器人
        const user = resolvedPeer.users?.find((u: any) => u.username === cleanUsername);
        if (user && user.bot) {
          type = ChannelType.BOT;
        } else {
          type = ChannelType.USER;
        }
        channel = resolvedPeer.users?.find((user: any) => user.username === cleanUsername);
      } else {
        console.log("未知的 peer 类型:", resolvedPeer.peer._);
        throw BusinessError.invalidRequest(
          `无法识别的用户类型: ${resolvedPeer.peer._}`,
        );
      }

      if (!channel) {
        // 提供更详细的错误信息
        const availableChats = resolvedPeer.chats?.map((c: any) => ({
          type: c._,
          username: c.username,
          title: c.title,
        })) || [];

        const availableUsers = resolvedPeer.users?.map((u: any) => ({
          type: u._,
          username: u.username,
          first_name: u.first_name,
          bot: u.bot,
        })) || [];

        if (availableChats.length === 0 && availableUsers.length === 0) {
          throw BusinessError.invalidRequest(
            `用户 ${channelUsername} 不存在或无法访问。请检查用户名是否正确，或确认该用户是否为公开用户。`,
          );
        } else {
          const availableItems = [...availableChats, ...availableUsers];
          throw BusinessError.invalidRequest(
            `用户 ${channelUsername} 未找到。可用的用户: ${availableItems.map((item: any) => `@${item.username}`).join(", ")}`,
          );
        }
      }

      return {
        id: randomUUID(),
        user_id: Telegram.getAuth().getAuthState()?.user?.id,
        channel_id: channel.id,
        access_hash: channel.access_hash,
        title: channel.title || channel.first_name || channel.username,
        username: channel.username,
        type,
        permissions: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error("获取用户信息失败:", error);

      // 如果是特定的 Telegram 错误，提供更友好的错误信息
      if (error.error_message) {
        switch (error.error_message) {
          case "USERNAME_NOT_OCCUPIED":
            throw BusinessError.invalidRequest(
              `用户 ${channelUsername} 不存在，请检查用户名是否正确`,
            );
          case "USERNAME_INVALID":
            throw BusinessError.invalidRequest(
              `用户名 ${channelUsername} 格式无效`,
            );
          case "CHANNEL_PRIVATE":
            throw BusinessError.invalidRequest(
              `频道 ${channelUsername} 是私有频道，需要先加入该频道`,
            );
          case "USER_PRIVACY_RESTRICTED":
            throw BusinessError.invalidRequest(
              `用户 ${channelUsername} 的隐私设置限制了访问`,
            );
          case "USER_DEACTIVATED":
            throw BusinessError.invalidRequest(
              `用户 ${channelUsername} 已被停用`,
            );
          default:
            throw new Error(`获取用户信息失败: ${error.error_message}`);
        }
      }

      throw error;
    }
  }

  // 获取频道信息
  async getChannelInfo(channelUsername: string): Promise<DbTelegramChannel> {
    const baseChannelInfo = await this.getBaseChannelInfo(channelUsername);

    // 根据类型处理权限
    let permissions = {
      canSendMessages: false,
      canPostMessages: false,
      isAdmin: false,
      isCreator: false,
    };

    try {
      if (baseChannelInfo.type === ChannelType.CHANNEL) {
        // 频道权限处理
        permissions = await this.getChannelPermissions(baseChannelInfo);
      } else if (baseChannelInfo.type === ChannelType.BOT) {
        // 机器人权限处理
        permissions = {
          canSendMessages: true, // 机器人通常可以发送消息
          canPostMessages: false, // 机器人不能发帖到频道
          isAdmin: false,
          isCreator: false,
        };
      } else if (baseChannelInfo.type === ChannelType.USER) {
        // 个人用户权限处理
        permissions = {
          canSendMessages: true, // 个人用户通常可以发送消息
          canPostMessages: false, // 个人用户不能发帖到频道
          isAdmin: false,
          isCreator: false,
        };
      }
    } catch (error) {
      console.log("获取权限信息失败，使用默认权限:", error);
      // 如果获取权限失败，根据类型设置默认权限
      if (baseChannelInfo.type === ChannelType.CHANNEL) {
        permissions.canSendMessages = false;
        permissions.canPostMessages = false;
      } else {
        permissions.canSendMessages = true;
        permissions.canPostMessages = false;
      }
    }

    return {
      ...baseChannelInfo,
      permissions,
    };
  }

  // 获取频道权限
  private async getChannelPermissions(channelInfo: DbTelegramChannel) {
    const permissions = {
      canSendMessages: false,
      canPostMessages: false,
      isAdmin: false,
      isCreator: false,
    };

    try {
      // 尝试获取频道的完整信息，包括权限
      const fullChannel = await this.client.call<any>(
        "channels.getFullChannel",
        {
          channel: {
            _: "inputPeerChannel",
            channel_id: channelInfo.channel_id,
            access_hash: channelInfo.access_hash,
          },
        },
      );

      // 检查用户是否是频道管理员
      if (fullChannel.full_chat?.participants?.participants) {
        const participant = fullChannel.full_chat.participants.participants
          .find(
            (p: any) =>
              p.user_id === Telegram.getAuth().getAuthState()?.user?.id,
          );

        if (participant) {
          permissions.isAdmin = participant.admin_rights !== undefined;
          permissions.isCreator =
            participant._ === "channelParticipantCreator";

          // 如果是管理员或创建者，通常可以发送消息
          if (permissions.isAdmin || permissions.isCreator) {
            permissions.canSendMessages = true;
            permissions.canPostMessages = true;
          }
        }
      }

      // 检查频道设置
      if (fullChannel.full_chat?.can_view_participants) {
        // 如果可以查看参与者，说明用户至少是频道的成员
        const channel = fullChannel.chats?.[0];
        if (channel) {
          permissions.canSendMessages = permissions.canSendMessages ||
            channel.broadcast === false;
        }
      }

      return permissions;
    } catch (error: any) {
      console.log("获取频道权限信息失败:", error);

      // 处理特定的权限错误
      if (error.error_message) {
        switch (error.error_message) {
          case "CHANNEL_PRIVATE":
            // 私有频道，用户需要先加入
            console.log("用户需要先加入私有频道");
            break;
          case "CHANNEL_INVALID":
            // 频道无效
            console.log("频道无效或已被删除");
            break;
          case "USER_NOT_PARTICIPANT":
            // 用户不是频道成员
            console.log("用户不是频道成员");
            break;
          default:
            console.log("其他权限错误:", error.error_message);
        }
      }

      // 返回默认权限（无权限）
      return permissions;
    }
  }

  // 发送消息到频道、机器人或个人用户
  async sendMessage(channelUsername: string, message: string): Promise<number> {
    try {
      const channelInfo = await this.getBaseChannelInfo(channelUsername);

      // 根据类型构建不同的 peer 对象
      let peer: any;
      if (channelInfo.type === ChannelType.CHANNEL) {
        peer = {
          _: "inputPeerChannel",
          channel_id: channelInfo.channel_id,
          access_hash: channelInfo.access_hash,
        };
      } else {
        // 机器人和个人用户使用 inputPeerUser
        peer = {
          _: "inputPeerUser",
          user_id: channelInfo.channel_id,
          access_hash: channelInfo.access_hash,
        };
      }

      const result = await this.client.call<any>("messages.sendMessage", {
        peer,
        message,
        random_id: Math.floor(Math.random() * 1000000000),
      });

      return result.id;
    } catch (error) {
      console.error("发送消息失败:", error);
      throw error;
    }
  }

  // 获取消息历史（频道、机器人或个人用户）
  async getChannelMessages(
    channelUsername: string,
    limit: number = 10,
    offsetId: number = 0,
  ): Promise<TelegramMessage[]> {
    try {
      const channelInfo = await this.getBaseChannelInfo(channelUsername);

      // 根据类型构建不同的 peer 对象
      let peer: any;
      if (channelInfo.type === ChannelType.CHANNEL) {
        peer = {
          _: "inputPeerChannel",
          channel_id: channelInfo.channel_id,
          access_hash: channelInfo.access_hash,
        };
      } else {
        // 机器人和个人用户使用 inputPeerUser
        peer = {
          _: "inputPeerUser",
          user_id: channelInfo.channel_id,
          access_hash: channelInfo.access_hash,
        };
      }

      const result = await this.client.call<any>("messages.getHistory", {
        peer,
        limit,
        offset_id: offsetId,
        offset_date: 0,
        add_offset: 0,
        max_id: 0,
        min_id: 0,
        hash: 0,
      });

      // 创建消息ID到消息内容的映射
      const messageMap = new Map<number, any>();
      result.messages.forEach((msg: any) => {
        messageMap.set(msg.id, msg);
      });

      return result.messages.reverse().map((msg: any) => {
        // 处理消息文本和链接
        let processedText = msg.message;
        const links: Array<{ text: string; url: string }> = [];

        // 处理 entities 中的链接
        if (msg.entities && Array.isArray(msg.entities)) {
          // 按 offset 排序，从后往前处理，避免位置偏移
          const sortedEntities = [...msg.entities].sort((a, b) =>
            b.offset - a.offset
          );

          for (const entity of sortedEntities) {
            if (entity._ === "messageEntityTextUrl") {
              const linkText = msg.message.substring(
                entity.offset,
                entity.offset + entity.length,
              );
              links.push({
                text: linkText,
                url: entity.url,
              });

              // 在文本中标记链接位置
              const before = processedText.substring(0, entity.offset);
              const after = processedText.substring(
                entity.offset + entity.length,
              );
              processedText = before + `[${linkText}](${entity.url})` + after;
            } else if (entity._ === "messageEntityMention") {
              const mention = msg.message.substring(
                entity.offset,
                entity.offset + entity.length,
              );
              // 处理 @ 提及
              processedText = processedText.replace(mention, `**${mention}**`);
            } else if (entity._ === "messageEntityBotCommand") {
              const command = msg.message.substring(
                entity.offset,
                entity.offset + entity.length,
              );
              // 处理机器人命令
              processedText = processedText.replace(command, `\`${command}\``);
            }
          }
        }

        // 处理回复消息内容
        let replyContent = null;
        if (msg.reply_to?.reply_to_msg_id) {
          const replyMsg = messageMap.get(msg.reply_to.reply_to_msg_id);
          if (replyMsg) {
            // 截取回复消息的前50个字符作为预览
            const previewText = replyMsg.message.length > 50
              ? replyMsg.message.substring(0, 50) + "..."
              : replyMsg.message;
            replyContent = {
              id: replyMsg.id,
              text: previewText,
              fullText: replyMsg.message,
            };
          } else {
            // 如果找不到回复的消息，只显示ID
            replyContent = {
              id: msg.reply_to.reply_to_msg_id,
              text: null,
              fullText: null,
            };
          }
        }

        return {
          id: msg.id,
          date: new Date(msg.date * 1000).toISOString(),
          text: processedText,
          rawText: msg.message, // 保留原始文本
          views: msg.views,
          from: msg.from_id,
          replyTo: msg.reply_to?.reply_to_msg_id || null,
          replyContent: replyContent,
          links: links,
          hasReplies: msg.replies?.replies > 0 || false,
          replyCount: msg.replies?.replies || 0,
        };
      });
    } catch (error) {
      console.error("获取消息失败:", error);
      throw error;
    }
  }
}
