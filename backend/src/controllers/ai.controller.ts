import { Request, Response, NextFunction } from "express";
import { aiService } from "../services/ai.service";
import { AuthRequest } from "../middleware/auth.middleware";

export const queryAI = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { inputText } = req.body;
    const userID = req.user!.userID;
    
    if (!inputText) {
      return res.status(400).json({ error: "inputText is required" });
    }
    
    const responseText = await aiService.processQuery(userID, inputText);
    
    res.json({
      queryID: `q_${Date.now()}`,
      userID,
      inputText,
      inputType: "text",
      responseText,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
