import { Response } from "express";
import zernio from "../config/zernio.js";
import { User } from "../models/User.js";
import { Account } from "../models/Account.js";
import { AuthRequest } from "../middlewares/authMiddlewares.js";

// 1. Helper to ensure user has an isolated Zernio Profile
const getOrCreateZernioProfile = async (user: any): Promise<string> => {
  try {
    const freshUser = await User.findById(user._id);
    if (!freshUser) {
      throw new Error("User not found");
    }

    if (freshUser.zernioProfileId) {
      return freshUser.zernioProfileId;
    }

    const createResult = await zernio.profiles.createProfile({
      body: { name: `${freshUser.name || freshUser.email || freshUser._id}'s workspace` } as any,
    });

    const created = (createResult.data as any)?.profile || createResult.data;
    const pid = created?._id || created?.id;
    if (!pid) {
      throw new Error("Failed to create Zernio profile - no ID returned");
    }

    freshUser.zernioProfileId = pid;
    await freshUser.save();
    user.zernioProfileId = pid;

    return pid;
  } catch (error: any) {
    console.error("getOrCreateZernioProfile Error:", error?.message || error);
    throw error;
  }
};

// 2. Generate OAuth authorization URL
// GET /api/auth/:platform
export const generateAuthUrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { platform } = req.params;
    const profileId = await getOrCreateZernioProfile(req.user);

    const origin = req.headers.origin || "http://localhost:5173";
    const redirectUrl = `${origin}/accounts`;

    const result = await zernio.connect.getConnectUrl({
      path: { platform: platform as any },
      query: {
        profileId,
        redirect_url: redirectUrl,
      },
    });

    const data = result.data as any;
    console.log("getConnectedUrl response:", JSON.stringify(data, null, 2));

    const authUrl = data?.authUrl;
    if (!authUrl) {
      res.status(500).json({ message: `Zernio returned no authUrl: ${JSON.stringify(data)}` });
      return;
    }

    res.json({ url: authUrl });
  } catch (error: any) {
    console.error("generateAuthUrl Error:", error?.message || error);
    res.status(500).json({ message: error?.message || "Server Error" });
  }
};

// 3. Sync connected accounts from Zernio into MongoDB
// GET /api/auth/sync
export const syncAccounts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profileId = await getOrCreateZernioProfile(req.user);

    const result = await zernio.accounts.listAccounts({
      query: { profileId } as any,
    });

    const data = result.data as any;
    const zernioAccounts: any[] = data?.accounts || (Array.isArray(data) ? data : []);
    const supportedPlatforms = ["twitter", "linkedin", "facebook", "instagram"];
    const syncedAccounts = [];

    for (const zAccount of zernioAccounts) {
      const zid = zAccount._id || zAccount.id;
      if (!zid) {
        console.warn("Skipping account with no ID:", zAccount);
        continue;
      }

      const rawPlatform = (zAccount.platform || zAccount.type || "").toLowerCase();
      const normalizedPlatform = supportedPlatforms.find((p) => rawPlatform.includes(p));
      if (!normalizedPlatform) {
        console.warn(`Skipping unsupported platform: "${rawPlatform}"`);
        continue;
      }

      // MongoDB update locked by user ID and platform
      const account = await (Account as any).findOneAndUpdate(
        { user:req.user._id, platform: normalizedPlatform },
        {
          user: req.user._id,
          platform: normalizedPlatform,
          handle: zAccount.username || zAccount.name || zAccount.handle || "Unknown",
          zernioAccountId: zid,
          status: "connected",
          avatarUrl: zAccount.avatarUrl || zAccount.picture || zAccount.profile_image_url,
        },
        { upsert: true, returnDocument: "after" }
      );

      if (account) {
        syncedAccounts.push(account);
      }
    }

    res.json(syncedAccounts);
  } catch (error: any) {
    console.error("syncAccounts Error:", error?.message || error);
    res.status(500).json({ message: error?.message || "Server Error" });
  }
};