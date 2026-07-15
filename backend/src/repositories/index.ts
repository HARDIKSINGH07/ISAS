import { PrismaUserRepository } from "./prisma/PrismaUserRepository";
import { PrismaAttendanceRepository } from "./prisma/PrismaAttendanceRepository";
import { PrismaAssignmentRepository } from "./prisma/PrismaAssignmentRepository";
import { PrismaEventRepository } from "./prisma/PrismaEventRepository";
import { PrismaRsvpRepository } from "./prisma/PrismaRsvpRepository";

export const repositories = {
  users: new PrismaUserRepository(),
  attendance: new PrismaAttendanceRepository(),
  assignments: new PrismaAssignmentRepository(),
  events: new PrismaEventRepository(),
  rsvps: new PrismaRsvpRepository(),
};
