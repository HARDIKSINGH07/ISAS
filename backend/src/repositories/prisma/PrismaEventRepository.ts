import { prisma } from "./prismaClient";
import { IEventRepository } from "../interfaces";
import { EventItem } from "../../models";

export class PrismaEventRepository implements IEventRepository {
  async findById(id: string): Promise<EventItem | null> {
    const event = await prisma.event.findUnique({
      where: { eventID: id, isDeleted: false },
    });
    return event as EventItem | null;
  }

  async findAll(): Promise<EventItem[]> {
    const events = await prisma.event.findMany({
      where: { isDeleted: false },
      orderBy: { dateTime: "asc" }
    });
    return events as EventItem[];
  }

  async findPublished(): Promise<EventItem[]> {
    const events = await prisma.event.findMany({
      where: { published: true, isDeleted: false },
      orderBy: { dateTime: "asc" }
    });
    return events as EventItem[];
  }

  async create(record: EventItem): Promise<EventItem> {
    const event = await prisma.event.create({
      data: record,
    });
    return event as EventItem;
  }

  async update(id: string, updates: Partial<EventItem>): Promise<EventItem | null> {
    try {
      const event = await prisma.event.update({
        where: { eventID: id },
        data: updates,
      });
      return event as EventItem;
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.event.update({
        where: { eventID: id },
        data: { isDeleted: true },
      });
      return true;
    } catch {
      return false;
    }
  }
}
