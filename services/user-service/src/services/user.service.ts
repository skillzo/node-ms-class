import { PrismaClient, User, UserProfile } from "@prisma/client";
import bcrypt from "bcrypt";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "@ecommerce/common";
import { AuthUtils } from "@ecommerce/common";
import { RegisterDto, UpdateProfileDto } from "../dto/user.dto";

const prisma = new PrismaClient();

export class UserService {
  async register(data: RegisterDto) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user and profile
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role || "customer",
        profile: data.name
          ? {
              create: {
                name: data.name,
              },
            }
          : undefined,
      },
      include: {
        profile: true,
      },
    });

    // Generate JWT token
    const token = AuthUtils.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password hash from response
    return {
      user: this.mapUserToResponse(user),
      token,
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Generate JWT token
    const token = AuthUtils.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const userResponse = this.mapUserToResponse(user);

    return {
      user: this.mapUserToResponse(user),
      token,
    };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    console.log("userResponse", user);

    if (!user) {
      throw new NotFoundError("User");
    }

    return this.mapUserToResponse(user);
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    // Update or create profile
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        name: data.name,
        address: data.address,
        phone: data.phone,
      },
      create: {
        userId,
        name: data.name,
        address: data.address,
        phone: data.phone,
      },
    });

    return profile;
  }

  async validateToken(token: string) {
    try {
      const payload = AuthUtils.verifyToken(token);
      const user = await this.getUserById(payload.userId);
      return { valid: true, user };
    } catch (error) {
      return { valid: false, error: "Invalid token" };
    }
  }

  private mapUserToResponse(user: User) {
    const { passwordHash: _, updatedAt: _2, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
    };
  }
}
