


// Get all activity
// GET /api/activity

import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddlewares.js";
import { ActivityLog } from "../models/ActivityLog.js";

export const getActivity = async (req:AuthRequest, res: Response): Promise<void> => {
    try {
        const activity = await ActivityLog.find({user: req.user._id}).sort({createdAt: -1}).limit(10).populate("relatedPost", "content");
        res.json(activity)
    } catch (error: any) {
        res.status(500).json({message: error?.message || "Server error"})
    }
}


// Single Activity Delete: DELETE /api/activity/:id
export const deleteActivity = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const log = await ActivityLog.findOneAndDelete({ _id: id, user: req.user._id });

    if (!log) {
      res.status(404).json({ message: "Activity log not found" });
      return;
    }

    res.json({ message: "Activity deleted successfully", id });
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Failed to delete activity" });
  }
};

// Clear All Activities: DELETE /api/activity
export const clearAllActivities = async (req: any, res: Response): Promise<void> => {
  try {
    await ActivityLog.deleteMany({ user: req.user._id });
    res.json({ message: "All activities cleared successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Failed to clear activities" });
  }
};