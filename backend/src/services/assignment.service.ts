import { repositories } from "../repositories";
import { generateId } from "../utils";
import { Assignment } from "../models";

export class AssignmentService {
  private asgRepo = repositories.assignments;

  async getAssignments() {
    return await this.asgRepo.findAll();
  }

  async getAssignment(id: string) {
    return await this.asgRepo.findById(id);
  }

  async createAssignment(data: Omit<Assignment, "assignmentID">) {
    return await this.asgRepo.create({
      ...data,
      assignmentID: generateId("as"),
    });
  }

  async updateAssignment(id: string, updates: Partial<Assignment>) {
    return await this.asgRepo.update(id, updates);
  }

  async deleteAssignment(id: string) {
    return await this.asgRepo.delete(id);
  }

  async toggleChecklist(assignmentID: string, itemID: string) {
    const asg = await this.asgRepo.findById(assignmentID);
    if (!asg) return null;
    
    const checklist = asg.checklist.map((c) =>
      c.itemID === itemID ? { ...c, done: !c.done } : c
    );
    
    return await this.asgRepo.update(assignmentID, { checklist });
  }

  async addChecklistItem(assignmentID: string, label: string) {
    const asg = await this.asgRepo.findById(assignmentID);
    if (!asg) return null;
    
    const checklist = [
      ...asg.checklist,
      { itemID: generateId("c"), label, done: false },
    ];
    
    return await this.asgRepo.update(assignmentID, { checklist });
  }
}

export const assignmentService = new AssignmentService();
