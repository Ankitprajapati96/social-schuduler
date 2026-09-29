import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { User } from "../models/User.js";

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Fallback secret ensures jwt.verify never gets undefined
      const secret = process.env.JWT_SECRET || "PostPulseProductionSecureJwtSecretKey2026SuperAuthToken";

      const decoded: any = jwt.verify(token, secret);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error: any) {
      res.status(401).json({ message: error?.message || "Not authorized token failed" });
    }
  } else {
    res.status(401).json({ message: "not authorized , no token" });
  }
};