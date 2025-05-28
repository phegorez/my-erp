import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto, UpdatePasswordDto } from './dto/auth-dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) { }

  async signin(dto: AuthDto) {
    // find user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email_address: dto.email_address
      }, select: {
        user_id: true,
        email_address: true,
        password: true,
        userMetaData: {
          select: {
            is_admin: true
          }
        }
      }
    })

    // if user dose not exist throw exception
    if (!user) throw new ForbiddenException('Credentials incorrect');

    // compare password with hash
    const passwordMatches = await argon2.verify(user.password, dto.password);

    // if passwprd is incorrect throw exception
    if (!passwordMatches) throw new ForbiddenException('Credentials incorrect')

    // Check password expiry
    let authenLog = await this.prisma.authenLog.findUnique({
      where: { user_id: user.user_id },
    });

    const passwordExpiryDays = parseInt(this.config.get<string>('PASSWORD_EXPIRY_DAYS', '90'), 10);

    if (authenLog) {
      const lastPasswordChange = authenLog.lastPassword_changeDate;

      // Calculate difference in days
      const passwordAge = (new Date().getTime() - new Date(lastPasswordChange).getTime()) / (1000 * 60 * 60 * 24);

      if (passwordAge > passwordExpiryDays) {
        throw new UnauthorizedException('Your password has expired. Please change your password.');
      }

      // Update last login date
      try {
        authenLog = await this.prisma.authenLog.update({
          where: { user_id: user.user_id },
          data: {
            lastLogin_date: new Date()
          }
        })
      } catch (error) {
        // It's good practice to handle potential errors during DB operations
        throw new Error('Failed to update authentication log.');
      }
    } else {
      // Create authenLog if it doesn't exist. lastPassword_changeDate will be set to now() by default.
      try {
        authenLog = await this.prisma.authenLog.create({
          data: {
            user_id: user.user_id,
            lastLogin_date: new Date(),
            // lastPassword_changeDate is set by Prisma default (now()) due to schema update
          }
        })
      } catch (error) {
        throw new Error('Failed to create authentication log.');
      }
    }

    // store in auth log
    try {
      await this.prisma.authenLog.upsert({
        where: {
          user_id: user.user_id,
        },
        update: {
          lastLogin_date: new Date(),
        },
        create: {
          user_id: user.user_id,
          lastLogin_date: new Date(),
        }
      })
    } catch (erorr) {
      throw new Error('Failed to store auth log', erorr);
    }

    // generate token
    const isAdmin = user.userMetaData?.[0]?.is_admin || false;
    const role = isAdmin ? 'admin' : 'user';
    const access_token = await this.signToken(
      user.user_id,
      user.email_address,
      role
    );

    return { access_token }

  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    // 1. Check if newPassword and confirmPassword match
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('New password and confirmation password do not match.');
    }

    // 2. Fetch the user from the database
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });
    if (!user) {
      // This case should ideally be prevented by the guard ensuring userId is valid
      throw new UnauthorizedException('User not found.');
    }

    // 3. Verify the current password
    const passwordMatches = await argon2.verify(user.password, dto.currentPassword);
    if (!passwordMatches) {
      throw new BadRequestException('Invalid current password.');
    }

    // 4. Hash the new password
    const hashedNewPassword = await argon2.hash(dto.newPassword);

    // 5. Update the user's password in the User table
    await this.prisma.user.update({
      where: { user_id: userId },
      data: { password: hashedNewPassword },
    });

    // 6. Update lastPassword_changeDate in AuthenLog table
    await this.prisma.authenLog.upsert({
      where: { user_id: userId },
      update: { lastPassword_changeDate: new Date() },
      create: {
        user_id: userId,
        lastLogin_date: new Date(), // Set lastLogin_date to now, or consider if it should be preserved if an old record existed.
        // For a password update, it's common to also update this or rely on a separate login flow.
        // Given the schema, a new AuthenLog entry needs lastLogin_date.
        lastPassword_changeDate: new Date(),
      },
    });

    return { message: 'Password updated successfully.' };
  }

  signToken(userId: string, email: string, role: string): Promise<string> {
    // create a payload
    const payload = {
      sub: userId,
      email_address: email,
      role: role
    }

    // sign the token
    const token = this.jwt.signAsync(payload, {
      expiresIn: payload.role === 'user' ? '30m' : '2h',
      secret: this.config.get<string>('JWT_SECRET'),
    });
    return token;
  }
}
