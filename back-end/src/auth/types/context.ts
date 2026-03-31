import type { Request, Response } from 'express';
import { JwtPayload } from './jwtPayload.dto';

export interface ContextWithJWTPayload {
  jwtPayload: JwtPayload;
  req: Request;
  res: Response;
}
