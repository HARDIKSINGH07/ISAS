import { prisma } from "./prismaClient";
import { IAssignmentRepository } from "../interfaces";
import { Assignment } from "../../models";

export class PrismaAssignmentRepository implements IAssignmentRepository {
  async findById(id: string): Promise<Assignment | null> {
    const assignment = await prisma.assignment.findUnique({
      where: { assignmentID: id, isDeleted: false },
      include: { checklist: true },
    });
    return assignment as Assignment | null;
  }

  async findByCreator(creatorID: string): Promise<Assignment[]> {
    const assignments = await prisma.assignment.findMany({
      where: { createdBy: creatorID, isDeleted: false },
      include: { checklist: true },
    });
    return assignments as Assignment[];
  }

  async findAll(): Promise<Assignment[]> {
    const assignments = await prisma.assignment.findMany({
      where: { isDeleted: false },
      include: { checklist: true },
      orderBy: { deadline: "asc" }
    });
    return assignments as Assignment[];
  }

  async create(record: Assignment): Promise<Assignment> {
    const { checklist, ...data } = record;
    
    const assignment = await prisma.assignment.create({
      data: {
        ...data,
        checklist: {
          create: checklist.map(c => ({
            itemID: c.itemID,
            label: c.label,
            done: c.done
          }))
        }
      },
      include: { checklist: true },
    });
    return assignment as Assignment;
  }

  async update(id: string, updates: Partial<Assignment>): Promise<Assignment | null> {
    try {
      const { checklist, ...data } = updates;
      
      const assignment = await prisma.assignment.update({
        where: { assignmentID: id },
        data: {
          ...data,
          ...(checklist && {
            checklist: {
              deleteMany: {},
              create: checklist.map(c => ({
                itemID: c.itemID,
                label: c.label,
                done: c.done
              }))
            }
          })
        },
        include: { checklist: true }
      });
      return assignment as Assignment;
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.assignment.update({
        where: { assignmentID: id },
        data: { isDeleted: true },
      });
      return true;
    } catch {
      return false;
    }
  }
}
