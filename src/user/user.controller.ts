import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Query, ForbiddenException } from '@nestjs/common';
import { UserService } from './user.service';
import { EditPersonalDto, UpdateUserDto, UserDto } from './dto';
import { JwtAuthGuard } from 'src/auth/common/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/common/decorator/get-user.decorators';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // add new user

  @Post()
  create(@GetUser('sub') userId: string, @GetUser('roles') roles: string[], @Body() userDto: UserDto) {
    if (roles.includes('super_admin') || roles.includes('admin')) {
      return this.userService.create(userDto, userId);
    }
    throw new ForbiddenException('Permission denied');
  }

  // get all usesr
  @Get()
  findAll(@GetUser('roles') roles: string[]) {
    if (roles.includes('super_admin') || roles.includes('admin')) {
      return this.userService.getAll()
    }
    throw new ForbiddenException('Permission denied');
  }

  @Get('filter')
  filterUsers(@Query() filter: { query: string; value: string }) {
    return this.userService.queryByFilter(filter);
  }

  @Get(':id')
  getUserById(@GetUser('roles') roles: string[], @Param('id') user_id: string) {
    if (roles.includes('super_admin') || roles.includes('admin')) {
      return this.userService.findOne(roles, user_id);
    }
    throw new ForbiddenException('Permission denied');
  }

  @Patch(':id')
  update(@GetUser('roles') roles: string[], @Param('id') user_id: string, @Body() dto: UpdateUserDto) {
    if (roles.includes('super_admin') || roles.includes('admin')) {
      return this.userService.update(user_id, dto);
    }
    throw new ForbiddenException('Permission denied');
  }

  @Delete(':id')
  remove(@GetUser('roles') roles: string[], @Param('id') user_id: string) {
    if (roles.includes('super_admin') || roles.includes('admin')) {
      return this.userService.remove(user_id);
    }
    throw new ForbiddenException('Permission denied');
  }
}

@UseGuards(JwtAuthGuard)
@Controller('my-profile')
export class MyProfileController {
  constructor(private readonly userService: UserService) { }

  @Get()
  findOne(@GetUser('sub') userId: string) {
    return this.userService.getProfile(userId);
  }

  @Patch('personal/edit')
  editPersonal(@GetUser('sub') userId: string, @Body() editPersonalDto: EditPersonalDto) {
    return this.userService.editPersonalInfo(userId, editPersonalDto);
  }
}

@UseGuards(JwtAuthGuard)
@Controller('departments')
export class DepartmentController {
  constructor(private readonly userService: UserService) { }
  @Get()
  getAllDepartment(@GetUser('roles') roles: string[]) {
    return this.userService.getAllDepartments(roles)
  }
}
