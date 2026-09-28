import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddlewares.js";
import { GoogleGenAI } from "@google/genai";
import { cloudinary } from "../config/cloudinary.js";
import axios from "axios";
import { Generation } from "../models/Generation.js"; // Aapka Generation model import
import { Post } from "../models/Post.js";
import imagekit from "../config/imagekit.js";
import { publishPostToZernio } from "../services/schedulerService.js";

//Generate Post
//POST /api/posts/generate

export const generatePost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { prompt, tone, generateImage } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(400).json({
        message:
          "Gemini API key is missing. Please add it to your server/.env file.",
      });
      return;
    }

    // --- 1. Text Generation (Gemini - Untouched) ---
    // --- 1. Text Generation (Gemini) ---
    const ai = new GoogleGenAI({ apiKey });

    const promptText = `Generate a social media post based on this prompt: "${prompt}".
Tone: ${tone},
Include relevant hashtags.
Format the response as JSON with "content" and "imagePrompt" fields.
The "imagePrompt" should be a highly descriptive prompt for an image generator that complements the post.`;

    // Dynamic alias list from your active account models
    const activeModels = [
      "gemini-flash-latest",
      "gemini-flash-lite-latest",
      "gemini-3.1-flash-lite",
    ];

    let textResponse: any = null;
    let lastErr: any = null;

    for (const modelName of activeModels) {
      try {
        console.log(`--> Generating with: ${modelName}`);
        textResponse = await ai.models.generateContent({
          model: modelName,
          contents: promptText,
        });
        if (textResponse?.text) break;
      } catch (err: any) {
        console.warn(`⚠️ ${modelName} failed, trying next alias...`);
        lastErr = err;
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }

    if (!textResponse?.text) {
      throw lastErr || new Error("Failed to generate post text.");
    }

    let content = "";
    let imagePrompt = prompt;

    try {
      const rawText = textResponse.text || "";
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      const data = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : { content: rawText, imagePrompt: prompt };
      content = data.content;
      imagePrompt = data.imagePrompt;
    } catch (e) {
      content = textResponse.text || "";
    }

    // --- 2. Image Generation (Google Imagen 3 + Cloudinary) ---
    // --- 2. Image Generation (Using GoogleGenAI SDK) ---
    // --- 2. Image Generation (Free, Fast, Zero-Auth AI Image Generation) ---
    let mediaUrl = "";

    if (generateImage) {
      try {
        console.log("--> Generating AI Image for prompt:", imagePrompt);

        // Prompt ko URL-safe encode karo
        const cleanPrompt = encodeURIComponent(imagePrompt.slice(0, 300));

        // Direct AI Image URL (Flux / Stable Diffusion based)
        mediaUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=800&height=800&nologo=true`;

        console.log("✅ AI Image generated successfully:", mediaUrl);
      } catch (err: any) {
        console.error("🔥 Image generation failed:", err?.message || err);
      }
    }
    // --- 3. Save generations to DB (Aapka original code - Untouched) ---
    const generation = await Generation.create({
      user: req.user._id,
      prompt,
      content,
      mediaUrl,
      mediaType: mediaUrl ? "image" : undefined,
      tone,
    });

    res.json(generation);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Server error" });
  }
};

// Get generations
// GET /api/posts/generations

export const getGenerations = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const generations = await Generation.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(generations);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Server error" });
  }
};

// Post posts
// GET /api/posts
export const getPosts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const posts = await Post.find({ user: req.user._id });
    res.json(posts);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Server error" });
  }
};

// Schedule posts
// POST /api/posts
export const schedulePost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { content, platforms, scheduledFor, status } = req.body;

    // Parse platforms if it comes as a stringified array from Formdata
    let parsePlatforms = platforms;
    if (typeof platforms === "string") {
      try {
        parsePlatforms = JSON.parse(platforms);
      } catch (e) {
        parsePlatforms = platforms.split(",");
      }
    }
    let mediaUrl: string | undefined = req.body.mediaUrl;
    let mediaType: "image" | "video" | undefined = req.body.mediaType;

    if (req.file) {
      try {
        console.log(
          "--> Starting upload to ImageKit, file size:",
          req.file.size,
        );

        const isVideo = req.file.mimetype.startsWith("video");
        const fileName = `post_${Date.now()}_${req.file.originalname || "upload"}`;

        const uploadResult = await imagekit.upload({
          file: req.file.buffer,
          fileName: fileName,
          folder: "/social-scheduler",
          useUniqueFileName: true,
        });

        console.log("--> ImageKit URL success:", uploadResult.url);
        mediaUrl = uploadResult.url;
        mediaType = isVideo ? "video" : "image";
      } catch (ikErr: any) {
        console.error("🔥 ImageKit Upload Error:", ikErr?.message || ikErr);
        throw ikErr;
      }
    }

    const post = await Post.create({
      user: req.user._id,
      content,
      platforms: parsePlatforms,
      mediaUrl,
      mediaType,
      scheduledFor,
      status,
    });
    res.status(201).json(post);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Server error" });
  }
};

// Update post schedule date (for Calendar drag-and-drop)
// PATCH /api/posts/:id/reschedule
export const reschedulePost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { scheduledFor } = req.body;

    const post = await Post.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { scheduledFor },
      { new: true },
    );

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.json(post);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Server error" });
  }
};

// ya jahan bhi schedulerService file hai uska path

// POST /api/posts/:id/publish-now
export const publishNowPost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await Post.findOne({ _id: id, user: req.user._id });

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    // 👉 Guard: Agar already publish ho rahi hai ya ho chuki hai toh duplicate call mat karo
    if (post.status === "published") {
      res.status(200).json({ message: "Post already published", post });
      return;
    }

    // Publish execution
    await publishPostToZernio(post);

    res.status(200).json({ message: "Post published successfully", post });
    return;
  } catch (error: any) {
    console.error("Manual publish failed:", error?.message);
    res
      .status(500)
      .json({ message: error?.message || "Failed to publish post" });
    return;
  }
};

// DELETE /api/posts/:id
export const deletePost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await Post.findOneAndDelete({ _id: id, user: req.user._id });

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.json({ message: "Post deleted successfully" });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: error?.message || "Failed to delete post" });
  }
};
