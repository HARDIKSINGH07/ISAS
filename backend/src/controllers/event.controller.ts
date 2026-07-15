import { Request, Response, NextFunction } from "express";
import { eventService } from "../services/event.service";
import { AuthRequest } from "../middleware/auth.middleware";

export const getEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const publishedOnly = req.user!.role !== "admin";
    const events = await eventService.getEvents(publishedOnly);
    res.json(events);
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    data.createdByAdminID = req.user!.userID;
    
    const event = await eventService.createEvent(data);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const event = await eventService.updateEvent(id as string, req.body);
    
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const success = await eventService.deleteEvent(id as string);
    
    if (!success) return res.status(404).json({ error: "Event not found" });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const toggleRsvp = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { field } = req.body; // 'attending' | 'bookmarked'
    const userID = req.user!.userID;
    
    if (field !== "attending" && field !== "bookmarked") {
      return res.status(400).json({ error: "Invalid field" });
    }
    
    const rsvp = await eventService.toggleRsvp(userID, id, field);
    res.json(rsvp);
  } catch (error) {
    next(error);
  }
};

export const getRsvp = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userID = req.user!.userID;
    
    const rsvp = await eventService.getRsvp(userID, id);
    if (!rsvp) return res.status(404).json({ error: "RSVP not found" });
    
    res.json(rsvp);
  } catch (error) {
    next(error);
  }
};
