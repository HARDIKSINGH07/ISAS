import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { repositories } from "../repositories";
import { Role } from "../models";

export class AuthService {
  private userRepo = repositories.users;

  async login(email: string, passwordPlain: string, role: Role) {
    const user = await this.userRepo.findByEmail(email);
    if (!user || user.role !== role) {
      return null;
    }

    const isValid = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isValid) {
      return null;
    }

    const token = jwt.sign(
      { userID: user.userID, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as any }
    );

    // omit password hash
    const { passwordHash, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
  }
}

export const authService = new AuthService();
