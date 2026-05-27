import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiResponse } from '../types';

export const getPublicHospitals = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hospitals = await prisma.hospital.findMany({
      where: { isActive: true },
      select: { id: true, name: true, address: true },
      orderBy: { name: 'asc' },
    });
    const response: ApiResponse = { success: true, data: hospitals };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
