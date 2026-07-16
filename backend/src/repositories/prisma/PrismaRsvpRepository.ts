import { prisma } from "./prismaClient";
import { IRsvpRepository } from "../interfaces";
import { RSVP } from "../../models";

export class PrismaRsvpRepository implements IRsvpRepository {
  async findByUserAndEvent(userID: string, eventID: string): Promise<RSVP | null> {
    const rsvp = await prisma.rSVP.findUnique({
      where: {
        userID_eventID: { userID, eventID }
      }
    });
    return rsvp as RSVP | null;
  }

  async findByUser(userID: string): Promise<RSVP[]> {
    const rsvps = await prisma.rSVP.findMany({
      where: { userID }
    });
    return rsvps as RSVP[];
  }

  async create(record: RSVP): Promise<RSVP> {
    const rsvp = await prisma.rSVP.create({
      data: record
    });
    return rsvp as RSVP;
  }

  async update(userID: string, eventID: string, updates: Partial<RSVP>): Promise<RSVP | null> {
    try {
      const rsvp = await prisma.rSVP.update({
        where: {
          userID_eventID: { userID, eventID }
        },
        data: updates
      });
      return rsvp as RSVP;
    } catch {
      return null;
    }
  }
}
