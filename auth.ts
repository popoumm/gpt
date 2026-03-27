import { Role } from '@prisma/client';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createDefaultWallet } from './wallet';

const JWT_SECRET = process.env.JWT_SECRET || 'replace-this-secret';

// 🔥 تولید کد رفرال یونیک
function generateReferralCode() {
  return 'PM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Register a new user
 */
export async function registerUser(params: {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  role?: Role;
  referralCode?: string;
}) {
  const { firstName, lastName, phone, password, role = 'USER', referralCode } = params;

  // ❗ چک تکراری بودن شماره
  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    throw new Error('این شماره تلفن قبلاً ثبت شده است');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // 🔥 پیدا کردن معرف
  let referredById: number | null = null;

  if (referralCode) {
    const refUser = await prisma.user.findUnique({
      where: { referralCode },
    });

    if (refUser) {
      referredById = refUser.id;
    }
  }

  // 🔥 ساخت یوزر (بدون referralCode فعلاً)
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      phone,
      password: hashedPassword,
      role,
      referredById,
    },
  });

  // 🔥 ساخت کد رفرال یونیک (مهم)
  let newCode = generateReferralCode();

  // جلوگیری از تکراری بودن (خیلی مهم)
  let exists = await prisma.user.findUnique({
    where: { referralCode: newCode },
  });

  while (exists) {
    newCode = generateReferralCode();
    exists = await prisma.user.findUnique({
      where: { referralCode: newCode },
    });
  }

  // ذخیره کد برای کاربر
  await prisma.user.update({
    where: { id: user.id },
    data: { referralCode: newCode },
  });

  // 🔥 ساخت ولت
  await createDefaultWallet(user.id);

  return user;
}

/**
 * Login
 */
export async function loginUser(params: {
  phone: string;
  password: string;
}) {
  const { phone, password } = params;

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    throw new Error('نام کاربری یا رمز عبور اشتباه است');
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error('نام کاربری یا رمز عبور اشتباه است');
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  });

  return { token, user };
}

/**
 * Verify token
 */
export function verifyToken(token: string): null | { id: number; role: Role } {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; role: Role };
  } catch {
    return null;
  }
}

/**
 * Auth middleware
 */
export function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers?.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'توکن احراز هویت یافت نشد' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ message: 'توکن نامعتبر است' });
  }

  req.user = payload;
  next();
}

/**
 * Role guard
 */
export function requireRole(requiredRole: Role) {
  return (req: any, res: any, next: any) => {
    const user = req.user as { id: number; role: Role };

    if (!user || user.role !== requiredRole) {
      return res.status(403).json({ message: 'شما به این بخش دسترسی ندارید' });
    }

    next();
  };
}