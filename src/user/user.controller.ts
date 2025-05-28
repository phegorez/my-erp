import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { EditPersonalDto, UserDto } from './dto';
import { JwtAuthGuard } from 'src/auth/common/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/common/decorator/get-user.decorators';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // add new user
  
  @Post()
  create(@GetUser('sub') userId: string, @GetUser('role') role: string, @Body() userDto: UserDto) {
    return this.userService.create(userDto, userId, role);
  }

  // get all usesr
  @Get()
  findAll(@GetUser('role') role: string) {
    return this.userService.getAll(role)
  }

  @Get('me')
  findOne(@GetUser('sub') userId: string) {
    // console.log('userId', userId)
    return this.userService.getProfile(userId);
  }

  @Get('departments')
  getAllDepartment(@GetUser('role') role: string) {
    return this.userService.getAllDepartments(role)
  }

  // @HttpCode(HttpStatus.ACCEPTED)
  @Patch('me/personal/edit')
  editPersonal(@GetUser('sub') userId: string, @Body() editPersonalDto : EditPersonalDto) {
    return this.userService.editPersonalInfo(userId, editPersonalDto)
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
