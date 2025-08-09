import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserModel, IUser } from "../models/user";

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET || 'fallback-jwt-secret';
    const decoded = jwt.verify(token, jwtSecret) as { id: string };

    const user = await UserModel.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    (req as any).user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token failed" });
  }
};

// Alias for isAuthenticated to match the import in routes
export const isAuthenticated = protect;

// Optional authentication: attach req.user if a valid token is present, otherwise continue
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if ((req as any).cookies?.token) {
      token = (req as any).cookies.token;
    }
    if (!token) return next();

    const jwtSecret = process.env.JWT_SECRET || 'fallback-jwt-secret';
    const decoded = jwt.verify(token, jwtSecret) as { id: string };
    const user = await UserModel.findById(decoded.id).select('-password');
    if (user) {
      (req as any).user = user;
    }
  } catch (_) {
    // Ignore errors and proceed unauthenticated
  }
  next();
};

// Admin-only middleware
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Admins only" });
  }
  
  next();
};
