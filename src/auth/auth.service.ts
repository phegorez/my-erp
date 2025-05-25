import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto/auth-dto';
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

    // // if passwprd is incorrect throw exception
    if (!passwordMatches) throw new ForbiddenException('Credentials incorrect')

    // generate token
    const role = user.userMetaData[0].is_admin ? 'admin' : 'user'
    const access_token = await this.signToken(user.user_id, user.email_address, role)

    return { access_token }

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
      secret: this.config.get('JWT_SECRET'),
    });
    return token;
  }
}
