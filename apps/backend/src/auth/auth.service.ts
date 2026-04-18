import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async requestOtp(phone: string) {
    // TODO: Integrate Twilio API for sending actual SMS OTPs
    // TODO: Setup NextAuth in frontend to communicate with this endpoint securely
    // Placeholder OTP logic
    console.log(`Requesting OTP for phone: ${phone}`);
    return { success: true, message: 'OTP sent successfully' };
  }

  async verifyOtp(phone: string, code: string) {
    // Placeholder logic - assuming '1234' is the valid OTP
    if (code !== '1234') {
      return { success: false, message: 'Invalid OTP' };
    }

    // Auto-register user if they don't exist yet
    let user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await this.prisma.user.create({ data: { phone } });
    }

    return { success: true, user, token: 'placeholder_jwt_token' };
  }
}
