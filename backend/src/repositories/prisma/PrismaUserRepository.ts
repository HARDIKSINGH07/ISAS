import { prisma } from "./prismaClient";
import { IUserRepository } from "../interfaces";
import { User, Role } from "../../models";

export class PrismaUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: email, mode: "insensitive" },
        isDeleted: false,
      },
    });
    return user as User | null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { userID: id, isDeleted: false },
    });
    return user as User | null;
  }

  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany({
      where: { isDeleted: false },
    });
    return users as User[];
  }

  async findByRole(role: Role): Promise<User[]> {
    const users = await prisma.user.findMany({
      where: { role, isDeleted: false },
    });
    return users as User[];
  }
}
