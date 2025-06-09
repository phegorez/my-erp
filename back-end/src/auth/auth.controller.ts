import { Body, Controller, HttpCode, HttpStatus, Patch, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, UpdatePasswordDto } from './dto';
import { Response } from 'express';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { GetUser } from './common/decorator/get-user.decorators';
import { ok } from 'assert';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(
    @Body() dto: AuthDto,
    @Res({ passthrough: true })
    res: Response
  ) {
    const { access_token } = await this.authService.signin(dto)
    // save to cookie
    res.cookie('access_token', access_token, {
      httpOnly: true,
    })
    return {
      message: 'Signin Successful',
      ok: true,
    }

    // for test
    // return await this.authService.signin(dto)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-password')
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @GetUser('sub') userId: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException('User not authenticated or user ID not found in token');
    }
    return this.authService.updatePassword(userId, updatePasswordDto);
  }
}
