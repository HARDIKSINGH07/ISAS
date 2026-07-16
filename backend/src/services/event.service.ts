import { repositories } from "../repositories";
import { generateId } from "../utils";
import { EventItem } from "../models";

export class EventService {
  private eventRepo = repositories.events;
  private rsvpRepo = repositories.rsvps;

  async getEvents(publishedOnly = false) {
    if (publishedOnly) {
      return await this.eventRepo.findPublished();
    }
    return await this.eventRepo.findAll();
  }

  async getEvent(id: string) {
    return await this.eventRepo.findById(id);
  }

  async createEvent(data: Omit<EventItem, "eventID">) {
    return await this.eventRepo.create({
      ...data,
      eventID: generateId("e"),
    });
  }

  async updateEvent(id: string, updates: Partial<EventItem>) {
    return await this.eventRepo.update(id, updates);
  }

  async deleteEvent(id: string) {
    return await this.eventRepo.delete(id);
  }

  async toggleRsvp(userID: string, eventID: string, field: "attending" | "bookmarked") {
    const existing = await this.rsvpRepo.findByUserAndEvent(userID, eventID);
    
    if (existing) {
      return await this.rsvpRepo.update(userID, eventID, {
        [field]: !existing[field],
      });
    }
    
    return await this.rsvpRepo.create({
      userID,
      eventID,
      attending: field === "attending",
      bookmarked: field === "bookmarked",
    });
  }

  async getRsvp(userID: string, eventID: string) {
    return await this.rsvpRepo.findByUserAndEvent(userID, eventID);
  }
}

export const eventService = new EventService();
