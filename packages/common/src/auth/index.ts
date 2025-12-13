import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TokenValidationResult {
  valid: boolean;
  payload?: JwtPayload;
  error?: string;
}

export class AuthUtils {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
  private static readonly SERVICE_API_KEY = process.env.SERVICE_API_KEY || 'service-api-key';

  static generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  static verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JwtPayload;
      return decoded;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  static validateToken(token: string): TokenValidationResult {
    try {
      const payload = this.verifyToken(token);
      return { valid: true, payload };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Token validation failed',
      };
    }
  }

  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    return parts[1];
  }

  static validateServiceApiKey(apiKey?: string): boolean {
    return apiKey === this.SERVICE_API_KEY;
  }

  static requireAuth(authHeader?: string): JwtPayload {
    const token = this.extractTokenFromHeader(authHeader);
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }
    return this.verifyToken(token);
  }

  static requireRole(authHeader: string | undefined, allowedRoles: string[]): JwtPayload {
    const payload = this.requireAuth(authHeader);
    if (!allowedRoles.includes(payload.role)) {
      throw new UnauthorizedError('Insufficient permissions');
    }
    return payload;
  }
}

