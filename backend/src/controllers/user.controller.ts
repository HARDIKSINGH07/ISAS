import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { repositories } from "../repositories";
import { roster as mockRoster } from "../seed";

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await repositories.users.findAll();
    // omit passwords
    const safeUsers = users.map(({ passwordHash, ...u }) => u);
    res.json(safeUsers);
  } catch (error) {
    next(error);
  }
};

export const getRoster = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(mockRoster);
  } catch (error) {
    next(error);
  }
};
