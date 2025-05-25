import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth-dto';
import { Response } from 'express';

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
      message: 'Signin Successful'
    }
  }
}
