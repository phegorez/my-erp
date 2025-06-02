import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Query } from '@nestjs/common';
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
  create(@GetUser('sub') userId: string, @GetUser('roles') roles: string[], @Body() userDto: UserDto) {
    return this.userService.create(userDto, userId, roles);
  }

  // get all usesr
  @Get()
  findAll(@GetUser('roles') roles: string[]) {
    return this.userService.getAll(roles)
  }

  @Get('filter')
  filterUsers(@Query() filter: { query: string; value: string }, @GetUser('roles') roles: string[]) {
    return this.userService.queryByFilter(filter, roles);
  }

  // get user by id for admin
  // @Get(':id')
  // getUserById(@GetUser('roles') roles: string[], @Param('id') user_id: string) {
  //   return this.userService.findOne(roles, user_id)
  // }

  @Get('me')
  findOne(@GetUser('sub') userId: string) {
    // console.log('userId', userId)
    return this.userService.getProfile(userId);
  }

  @Get('departments')
  getAllDepartment(@GetUser('roles') roles: string[]) {
    return this.userService.getAllDepartments(roles)
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

  //Edit user by admin
  @Patch('edit')
  editUser(@GetUser('roles') roles: string[], userDto: UserDto) {

  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
