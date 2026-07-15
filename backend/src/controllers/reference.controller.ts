import { Request, Response, NextFunction } from "express";
import { SUBJECTS, SECTIONS } from "../seed";

export const getSubjects = (req: Request, res: Response, next: NextFunction) => {
  res.json(SUBJECTS);
};

export const getSections = (req: Request, res: Response, next: NextFunction) => {
  res.json(SECTIONS);
};
