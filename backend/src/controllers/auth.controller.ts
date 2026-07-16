import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { repositories } from "../repositories";

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, role } = req.body;
    const result = await authService.login(email, password, role);

    if (!result) {
      return res.status(401).json({ error: "Invalid credentials or role" });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await repositories.users.findById(req.user!.userID);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};
