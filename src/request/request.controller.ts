import {
  Controller, Get, Post, Body, Patch, Param, Query, UseGuards, BadRequestException
} from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequestDto, UpdateRequestDto, ProcessApprovalDto } from './dto';
import { Request as RequestModel, User as UserModel } from '@prisma/client';
import { JwtAuthGuard } from '../auth/common/guards/jwt-auth.guard'; // Added
import { GetUser } from '../auth/common/decorator/get-user.decorators'; // Added

@UseGuards(JwtAuthGuard) // Apply to all methods in this controller
@Controller('requests')
export class RequestController {
  constructor(private readonly requestService: RequestService) { }

  @Post()
  async createRequest(
    @Body() dto: CreateRequestDto, // user_id will be removed from here
    @GetUser('sub') userId: string,
  ): Promise<RequestModel> {
    if (!userId) {
      throw new BadRequestException('User ID not found in token.');
    }
    // Create a new DTO or modify it to ensure user_id from token is used
    return this.requestService.createRequest(dto, userId);
  }

  @Get('/my-requests')
  async findUserRequests(
    @GetUser('sub') userId: string
  ): Promise<RequestModel[]> {
    if (!userId) throw new BadRequestException('User ID not found in token.');
    return this.requestService.findUserRequests(userId);
  }

  @Get(':id')
  async findRequestById(
    @Param('id') id: string,
    @GetUser('sub') userIdFromToken: string, // For potential ownership check in service
  ): Promise<RequestModel> {
    return this.requestService.findRequestById(id, userIdFromToken);
  }

  @Post(':id/return')
  async returnItems(
    @Param('id') requestId: string,
    @GetUser('user_id') actingUserId: string
  ): Promise<RequestModel | null> {
    if (!actingUserId) throw new BadRequestException('Acting user ID not found in token.');
    return this.requestService.returnItems(requestId, actingUserId);
  }

  // @Patch(':id')
  // async updateRequestDetails(
  //   @Param('id') id: string,
  //   @Body() dto: UpdateRequestDto,
  //   @GetUser('user_id') requestingUserId: string,
  // ): Promise<RequestModel> {
  //   if (!requestingUserId) throw new BadRequestException('Requesting user ID not found in token.');
  //   return this.requestService.updateRequestDetails(id, dto, requestingUserId);
  // }
}

@UseGuards(JwtAuthGuard)
@Controller('approvals')
export class RequestApprovalController {
  constructor(private readonly requestService: RequestService) { }

  @Get()
  async findAllApprovals(
    @GetUser('sub') userId: string
  ): Promise<RequestModel[]> {
    if (!userId) throw new BadRequestException('User ID not found in token.');
    return this.requestService.findAllApprovals(userId);
  }

  @Patch(':id/process-approval')
  async processRequestApproval(
    @Param('id') requestId: string,
    @Body() dto: ProcessApprovalDto,
    @GetUser('sub') userId: string, // Using sub from JWT token
  ): Promise<RequestModel> {
    if (!userId) {
      throw new BadRequestException('Approving user ID not found in token.');
    }
    return this.requestService.processRequestApproval(requestId, dto, userId);
  }
}