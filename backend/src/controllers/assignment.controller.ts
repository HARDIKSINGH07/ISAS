import { Request, Response, NextFunction } from "express";
import { assignmentService } from "../services/assignment.service";
import { AuthRequest } from "../middleware/auth.middleware";

export const getAssignments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const assignments = await assignmentService.getAssignments();
    res.json(assignments);
  } catch (error) {
    next(error);
  }
};

export const createAssignment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    data.createdBy = req.user!.userID; // ensure the creator is the logged in user
    
    if (!data.checklist) {
      data.checklist = [];
    }
    
    const assignment = await assignmentService.createAssignment(data);
    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
};

export const updateAssignment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const assignment = await assignmentService.updateAssignment(id as string, req.body);
    
    if (!assignment) return res.status(404).json({ error: "Assignment not found" });
    res.json(assignment);
  } catch (error) {
    next(error);
  }
};

export const deleteAssignment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const success = await assignmentService.deleteAssignment(id as string);
    
    if (!success) return res.status(404).json({ error: "Assignment not found" });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const toggleChecklist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const itemID = req.params.itemID as string;
    const assignment = await assignmentService.toggleChecklist(id as string, itemID);
    
    if (!assignment) return res.status(404).json({ error: "Assignment not found" });
    res.json(assignment);
  } catch (error) {
    next(error);
  }
};

export const addChecklistItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { label } = req.body;
    const assignment = await assignmentService.addChecklistItem(id, label);
    
    if (!assignment) return res.status(404).json({ error: "Assignment not found" });
    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
};
