import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class PrototypeAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;

    if (userId && userRole) {
      // Attach to request for RolesGuard or route handlers
      (req as any).user = { id: userId, role: userRole };
    }

    next();
  }
}
