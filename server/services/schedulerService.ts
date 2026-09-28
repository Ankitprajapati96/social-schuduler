import cron from "node-cron";
import { Post } from "../models/Post.js";
import { Account } from "../models/Account.js";
import { ActivityLog } from "../models/ActivityLog.js";
import zernio from "../config/zernio.js";

// 1. Ek reusable function banaya jise Cron aur "Publish Now" dono use karenge
export const publishPostToZernio = async (post: any) => {
  const accounts = await Account.find({
    user: post.user,
    platform: { $in: post.platforms },
    status: "connected",
    zernioAccountId: { $exists: true },
  });

  if (accounts.length === 0) {
    throw new Error(`No connected zernio accounts found for post ${post._id}`);
  }

  const zernioPlatforms = accounts.map((acc) => ({
    platform: acc.platform as any,
    accountId: acc.zernioAccountId!,
  }));

  const payload = {
    content: post.content,
    publishNow: true,
    ...(post.mediaUrl ? { mediaItems: [{ type: post.mediaType || "image", url: post.mediaUrl }] } : {}),
    platforms: zernioPlatforms,
  };

  console.log(`Publishing post ${post._id} to zernio with media: ${post.mediaUrl || "none"}`);

const response = await zernio.posts.createPost({
    body: payload,
  });

  console.log("--> Full Zernio API Response:", JSON.stringify(response, null, 2));

  // Zernio response object extraction (covers all possible SDK formats)
  const publishedPost = (response as any)?.post?.post || (response as any)?.post || (response as any)?.data || response;

  if (!publishedPost) {
    throw new Error("failed to get post object from zernio response");
  }

  console.log(`zernio post created: ${(publishedPost as any)?._id || (publishedPost as any)?.id || "OK"}`);

  post.status = "published";
  await post.save();

  const snippet = post.content ? `"${post.content.slice(0, 65)}${post.content.length > 65 ? "..." : ""}"` : "";
  const platformNames = accounts.map((a) => a.platform).join(", ");

  await ActivityLog.create({
    user: post.user,
    actionType: "POST_PUBLISHED",
    description: `Published to ${platformNames}: ${snippet}`,
    relatedPost: post._id,
  });

  return publishedPost;
};

// 2. Cron Job
export const initScheduler = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const postsToPublish = await Post.find({ status: "scheduled", scheduledFor: { $lte: now } });

      for (const post of postsToPublish) {
        try {
          await publishPostToZernio(post);
        } catch (err: any) {
          console.error(`failed to publish post ${post._id}:`, err?.response?.data || err?.message);
          post.status = "failed";
          await post.save();
        }
      }

      if (postsToPublish.length > 0) {
        console.log(`Evaluated ${postsToPublish.length} posts at ${now.toISOString()}`);
      }
    } catch (error) {
      console.error("Error in scheduler:", error);
    }
  });

  console.log("scheduler service initialized");
};