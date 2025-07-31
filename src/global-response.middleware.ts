import { Request, Response, NextFunction } from 'express';

export function globalResponseMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const oldJson = res.json;
  res.json = function (data: any) {
    // Only wrap if not already wrapped (avoid double-wrapping)
    if (data && typeof data === 'object' && data.success !== undefined) {
      return oldJson.call(this, data);
    }
    return oldJson.call(this, {
      success: true,
      data,
      message: null,
      error: null,
    });
  };
  next();
}
