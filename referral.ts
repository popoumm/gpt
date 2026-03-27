import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
// The reward (e.g. in USDT) given for each successful referral. Adjust
// this constant to suit your business model.
const REFERRAL_REWARD = 1.0;

/**
 * Generate a random alphanumeric referral code. Uses base36 encoding to
 * produce a short code. Converts to uppercase for consistency.
 */
function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Assign a referral code to an existing user. If the user already has a
 * referral code, it is returned. Otherwise a new unique code is
 * generated and saved to the user record.
 */
export async function assignReferralCode(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('کاربر یافت نشد');
  if (user.referralCode) return user.referralCode;
  let code: string;
  // Ensure the code is unique by checking the database
  do {
    code = generateReferralCode();
  } while (await prisma.user.findUnique({ where: { referralCode: code } }));
  await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
  return code;
}

/**
 * Register a new user, optionally using a referral code. If the
 * `referralCode` is provided and valid, the inviter's `referredById`
 * field on the new user is set and their earnings are incremented by
 * `REFERRAL_REWARD`.
 */
export async function registerUserWithReferral(params: {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  role?: Role;
  referralCode?: string;
}) {
  const { firstName, lastName, phone, password, role = 'USER', referralCode } = params;
  // Check if phone number is already taken
  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    throw new Error('این شماره قبلاً ثبت شده است');
  }
  // Hash the password (using bcrypt from auth.ts would be preferable)
  const hashedPassword = await bcrypt.hash(password, 10);
  // Find inviter by referral code
  let inviterId: number | null = null;
  if (referralCode) {
    const inviter = await prisma.user.findUnique({ where: { referralCode } });
    if (inviter) inviterId = inviter.id;
  }
  // Create the user; ensure the User model has fields `referralCode` (String?) and
  // `referredById` (Int?)
  const newUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      phone,
      password: hashedPassword,
      role,
      referredById: inviterId,
    },
  });
  // If there is a valid inviter, increment their referral earnings
  if (inviterId) {
    await prisma.user.update({
      where: { id: inviterId },
      data: { referralEarnings: { increment: REFERRAL_REWARD } },
    });
  }
  return newUser;
}

/**
 * Get referral statistics for a user. Returns the number of invited users
 * and the total earnings from referrals. Requires that the User model
 * includes fields `referredById` and `referralEarnings`.
 */
export async function getReferralSummary(userId: number) {
  // Count how many users were referred by this user
  const count = await prisma.user.count({ where: { referredById: userId } });
  // Retrieve the user's current earnings
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const earnings = user?.referralEarnings ?? 0;
  return { invitedCount: count, earnings };
}