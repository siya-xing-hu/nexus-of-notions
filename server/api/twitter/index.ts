import { defineEventHandler, getQuery } from "h3";
import { HttpMethod, response } from "@/lib/api";
import { BusinessError } from "@/lib/exception/BusinessError";
import { SystemError } from "@/lib/exception/SystemError";

const AUTH_TOKEN =
  "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";

const FEATURES = {
  creator_subscriptions_tweet_preview_api_enabled: true,
  premium_content_api_read_enabled: false,
  communities_web_enable_tweet_community_results_fetch: true,
  c9s_tweet_anatomy_moderator_badge_enabled: true,
  responsive_web_grok_analyze_button_fetch_trends_enabled: false,
  responsive_web_grok_analyze_post_followups_enabled: false,
  responsive_web_jetfuel_frame: true,
  responsive_web_grok_share_attachment_enabled: true,
  articles_preview_enabled: true,
  responsive_web_edit_tweet_api_enabled: true,
  graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
  view_counts_everywhere_api_enabled: true,
  longform_notetweets_consumption_enabled: true,
  responsive_web_twitter_article_tweet_consumption_enabled: true,
  tweet_awards_web_tipping_enabled: false,
  responsive_web_grok_show_grok_translated_post: false,
  responsive_web_grok_analysis_button_from_backend: true,
  creator_subscriptions_quote_tweet_preview_enabled: false,
  freedom_of_speech_not_reach_fetch_enabled: true,
  standardized_nudges_misinfo: true,
  tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
  longform_notetweets_rich_text_read_enabled: true,
  longform_notetweets_inline_media_enabled: true,
  payments_enabled: false,
  profile_label_improvements_pcf_label_in_post_enabled: true,
  responsive_web_profile_redirect_enabled: false,
  rweb_tipjar_consumption_enabled: true,
  verified_phone_label_enabled: false,
  responsive_web_grok_image_annotation_enabled: true,
  responsive_web_grok_imagine_annotation_enabled: true,
  responsive_web_grok_community_note_auto_translation_is_enabled: false,
  responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
  responsive_web_graphql_timeline_navigation_enabled: true,
  responsive_web_enhance_cards_enabled: false,
};

const FIELD_TOGGLES = {
  withArticleRichContentState: true,
  withArticlePlainText: false,
};

export default defineEventHandler(async (event) => {
  if (event.method === HttpMethod.GET) {
    return handleGet(event);
  }
  const error = BusinessError.methodNotAllowed().toErrorObj();
  return response(event, null, error, error.errorCode);
});

async function handleGet(event: any) {
  const query = getQuery(event);
  const { tweetId } = query;

  if (!tweetId || typeof tweetId !== "string") {
    const error = BusinessError.required("tweetId is required").toErrorObj();
    return response(event, null, error, error.errorCode);
  }

  try {
    const videoInfo = await getVideoInfo(tweetId, event.headers);
    return response(event, { data: videoInfo });
  } catch (error) {
    console.error(error);
    if (error instanceof BusinessError) {
      const errorObj = error.toErrorObj();
      return response(event, null, errorObj, errorObj.errorCode);
    }
    const errorObj = SystemError.internalServerError().toErrorObj();
    return response(event, null, errorObj, errorObj.errorCode);
  }
}

async function getVideoInfo(tweetId: string, headers: Headers) {
  const variables = {
    tweetId: tweetId,
    includePromotedContent: true,
    withBirdwatchNotes: true,
    withVoice: true,
    withCommunity: true,
  };

  const url = `https://api.x.com/graphql/tCVRZ3WCvoj0BVO7BKnL-Q/TweetResultByRestId?variables=${encodeURIComponent(
    JSON.stringify(variables),
  )}&features=${encodeURIComponent(
    JSON.stringify(FEATURES),
  )}&fieldToggles=${encodeURIComponent(JSON.stringify(FIELD_TOGGLES))}`;

  const requestHeaders = {
    "User-Agent":
      headers.get("user-agent") ||
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    Authorization: AUTH_TOKEN,
    Cookie: headers.get("cookie") || "",
  };

  const twitterResponse = await fetch(url, { headers: requestHeaders });

  if (!twitterResponse.ok) {
    const errorText = await twitterResponse.text();
    console.error("Twitter API error:", errorText);
    throw new BusinessError(
      `Failed to fetch tweet data from Twitter API. Status: ${twitterResponse.status}`,
      twitterResponse.status,
    );
  }

  const data = await twitterResponse.json();

  const media = data?.data?.tweetResult?.result?.legacy?.entities?.media?.[0];
  if (!media) {
    throw new BusinessError("Media not found in tweet.", 404);
  }

  const variants = media?.video_info?.variants;
  const thumbnailUrl = media?.media_url_https;

  if (!variants || !Array.isArray(variants)) {
    throw new BusinessError("Video not found in tweet.", 404);
  }

  const processedVariants = variants
    .filter((v: any) => v.content_type === "video/mp4")
    .map((v: any) => {
      const resolutionMatch = v.url.match(/(\d+x\d+)/);
      return {
        bitrate: v.bitrate,
        content_type: v.content_type,
        url: v.url,
        resolution: resolutionMatch ? resolutionMatch[1] : null,
      };
    });

  return {
    thumbnailUrl,
    variants: processedVariants,
  };
}
