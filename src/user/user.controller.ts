import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto';
import { JwtAuthGuard } from 'src/auth/common/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/common/decorator/get-user.decorators';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // add new user
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@GetUser('sub') userId: string, @GetUser('role') role: string, @Body() userDto: UserDto) {
    return this.userService.create(userDto, userId, role);
  }

  @Get()
  findAll() {
    return 'this is find all users';
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  findOne(@GetUser('sub') userId: string) {
    // console.log('userId', userId)
    return this.userService.getProfile(userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() userDto: UserDto) {
    return this.userService.update(+id, userDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
