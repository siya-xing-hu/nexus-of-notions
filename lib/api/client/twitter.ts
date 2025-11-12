import { HttpMethod } from "../index";
import { request } from "../request";

export interface VideoVariant {
  bitrate?: number;
  content_type: string;
  url: string;
  resolution?: string | null;
}

export interface TwitterVideoData {
  thumbnailUrl: string;
  variants: VideoVariant[];
}

export const twitterApi = {
  getVideo: (tweetId: string) =>
    request("/api/twitter", HttpMethod.GET, {
      query: { tweetId },
    }) as Promise<TwitterVideoData>,
};

export type TwitterApi = typeof twitterApi;
