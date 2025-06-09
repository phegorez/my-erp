import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto, UpdateRequestDto, ProcessApprovalDto } from './dto'; // Add this
import { Request, RequestStatus, Item } from '@prisma/client';

@Injectable()
export class RequestService {
  constructor(private prisma: PrismaService) { }

  async createRequest(dto: CreateRequestDto, user_id: string): Promise<Request> {
    const { requested_items, user_manager_id, comment, start_date, end_date } = dto;

    // Validate user exists
    const user = await this.prisma.user.findUnique({ where: { user_id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${user_id}" not found.`);
    }

    // Validate all items exist and are available
    const itemIds = requested_items.map(item => item.item_id);
    const items = await this.prisma.item.findMany({
      where: {
        item_id: { in: itemIds },
      },
    });

    if (items.length !== itemIds.length) {
      throw new NotFoundException('One or more items not found.');
    }

    for (const item of items) {
      if (!item.is_available) {
        throw new BadRequestException(`Item "${item.item_name}" (ID: ${item.item_id}) is not available.`);
      }
    }

    // Start transaction
    return this.prisma.$transaction(async (tx) => {
      const newRequest = await tx.request.create({
        data: {
          user_id,
          start_date: new Date(start_date),
          end_date: new Date(end_date),
          status: RequestStatus.Waiting_Manager_Approval, // Default status
          user_manager_id,
          requestItems: {
            create: requested_items.map(item => ({
              item_id: item.item_id,
              quantity: item.quantity, // Assuming quantity is 1 for now
            })),
          },
          comment: comment || '', // Optional comment
        },
        include: {
          requestItems: {
            include: {
              item: true
            }
          }, user: {
            select: {
              first_name: true,
              last_name: true,
              email_address: true,
              Personal: {
                select: {
                  phone_number: true,
                }
              }
            }
          }
        },
      });

      // Optionally, mark items as unavailable (or part of a pending request) here
      // For now, availability change will happen upon approval.

      return newRequest;
    });
  }

  async findUserRequests(userId: string): Promise<Request[]> {
    return this.prisma.request.findMany({
      where: { user_id: userId },
      include: {
        requestItems: { include: { item: true } },
        approvals: true, // Include approvals if needed
      },
      orderBy: { request_date: 'desc' },
    });
  }

  async findRequestById(requestId: string, userId?: string): Promise<Request> {
    // If userId is provided, ensure the request belongs to the user or user is an admin
    // This logic will be refined when auth is fully in place.
    const request = await this.prisma.request.findUnique({
      where: { request_id: requestId },
      include: {
        requestItems: { include: { item: true } },
        user: {
          select: {
            first_name: true,
            last_name: true,
            email_address: true,
            Personal: {
              select: {
                phone_number: true,
              },
            },
          },
        },
        approvals: { include: { approver: true } },
      },
    });

    if (!request) {
      throw new NotFoundException(`Request with ID "${requestId}" not found.`);
    }

    // Basic ownership check, can be enhanced by roles later
    if (userId && request.user_id !== userId) {
      // Check if user is an admin (needs role system access)
      // For now, simple forbidden if not owner.
      // This check might be better placed in the controller or a guard.
      throw new ForbiddenException('You do not have permission to view this request.');
    }
    return request;
  }

  // --- Add a method for processing request approvals ---
  async processRequestApproval(
    requestId: string,
    dto: ProcessApprovalDto,
    approvingUserId: string,
  ): Promise<Request> {
    const { status, comment } = dto;

    // Validate request exists
    const request = await this.prisma.request.findUnique({
      where: { request_id: requestId },
      include: { requestItems: true },
    });

    if (!request) {
      throw new NotFoundException(`Request with ID "${requestId}" not found.`);
    }

    // Validate the current status allows for approval
    if (request.status !== RequestStatus.Waiting_Manager_Approval) {
      throw new BadRequestException(`Request is not in a state that allows approval. Current status: ${request.status}`);
    }

    // validate is approving user is grade 7
    const approvingUser = await this.prisma.user.findUnique({
      where: { user_id: approvingUserId },
      include: {
        Employee: {
          select: {
            grade: true, // Assuming grade is a field in Employee model
          }
        }
      }, // Assuming grade is a field in User model
    });

    if (!approvingUser || !approvingUser.Employee || approvingUser.Employee.grade !== "7") {
      throw new ForbiddenException('Only users with grade 7 can approve requests.');
    }

    // Start transaction
    return this.prisma.$transaction(async (tx) => {
      // Update the request status based on approval
      let updatedStatus: RequestStatus;
      if (status === 'Approved') {
        updatedStatus = RequestStatus.Waiting_PIC_Approval; // Or whatever the success status is
      } else if (status === 'Reject') {
        updatedStatus = RequestStatus.Reject; // Or whatever the reject status is
      } else if (status === 'Revise') {
        updatedStatus = RequestStatus.Waiting_Manager_Approval; // Assuming this means it needs to be revised
      } else if (status === 'Canceled') {
        updatedStatus = RequestStatus.Canceled; // Assuming this is a valid status
      } else {
        throw new BadRequestException('Invalid approval status provided.');
      }

      // Update the request with the new status and add an approval record
      const updatedRequest = await tx.request.update({
        where: { request_id: requestId },
        data: {
          status: updatedStatus,
          approvals: {
            create: {
              approver_id: approvingUserId,
              comment,
              role: 'Manager', // or the appropriate role string/enum value
              status: status,  // assuming status is either 'Approved' or 'Reject'
            },
          },
        },
        include: { requestItems: true, user: true, approvals: true },
      });

      return updatedRequest;
    });
  }

  // for PIC approval
  async processPicApproval(
    requestId: string, dto: ProcessApprovalDto, approvingUserId: string, userRoles: string
  ) {
    const { status, comment } = dto;

    // Validate request exists
    const request = await this.prisma.request.findUnique({
      where: { request_id: requestId },
      include: { requestItems: true },
    });

    if (!request) {
      throw new NotFoundException(`Request with ID "${requestId}" not found.`);
    }

    // Validate the current status allows for approval
    if (request.status !== RequestStatus.Waiting_PIC_Approval) {
      throw new BadRequestException(`Request is not in a state that allows approval. Current status: ${request.status}`);
    }

    // validate is approving user is pic
    const approvingUser = await this.prisma.role.findFirst({
      where: {
        role_name: 'pic'
      },
      include: {
        UserRole: {
          select: {
            user_id: true, // Assuming UserRole has a user_id field
          }
        }
      }
    });

    const isPic = approvingUser?.UserRole.some(userRole => userRole.user_id === approvingUserId);
    
    if (!isPic) {
      throw new ForbiddenException('Only users with PIC role can approve requests.');
    }

    // Start transaction
    return this.prisma.$transaction(async (tx) => {
      // Update the request status based on approval
      let updatedStatus: RequestStatus;
      if (status === 'Approved') {
        updatedStatus = RequestStatus.Approved; // Or whatever the success status is
        // Optionally, mark items as unavailable here if needed
        await tx.item.updateMany({
          where: { item_id: { in: request.requestItems.map(ri => ri.item_id) } },
          data: { is_available: false },
        });
      } else if (status === 'Reject') {
        updatedStatus = RequestStatus.Reject; // Or whatever the reject status is
      } else if (status === 'Revise') {
        updatedStatus = RequestStatus.Waiting_Manager_Approval; // Assuming this means it needs to be revised
      } else if (status === 'Canceled') {
        updatedStatus = RequestStatus.Canceled; // Assuming this is a valid status
      } else {
        throw new BadRequestException('Invalid approval status provided.');
      }

      // Update the request with the new status and add an approval record
      const updatedRequest = await tx.request.update({
        where: { request_id: requestId },
        data: {
          status: updatedStatus,
          approvals: {
            create: {
              approver_id: approvingUserId,
              comment,
              role: 'PIC', // or the appropriate role string/enum value
              status: status,  // assuming status is either 'Approved' or 'Reject'
            },
          },
        },
        include: { requestItems: true, user: {
          select: {
            first_name: true,
            last_name: true,
            email_address: true,
            Personal: {
              select: {
                phone_number: true,
              }
            }
          }
        }, approvals: true },
      });

      return updatedRequest;
    });
  }

  // --- Add a method for returning items ---
  async returnItems(requestId: string, actingUserId: string): Promise<Request | null> {
    // actingUserId could be the borrower or an admin.
    // Further validation might be needed (e.g. request must be in 'Success' state).

    return this.prisma.$transaction(async (tx) => {
      const request = await tx.request.findUnique({
        where: { request_id: requestId },
        include: { requestItems: true }
      });

      if (!request) {
        throw new NotFoundException(`Request with ID "${requestId}" not found.`);
      }

      // Validate if the user is authorized to return (borrower or admin)
      // For now, we assume actingUserId is authorized.
      // if (request.user_id !== actingUserId && !isUserAdmin(actingUserId)) { // isUserAdmin would be a helper
      //    throw new ForbiddenException('You are not authorized to return these items.');
      // }

      if (request.status !== RequestStatus.Success) {
        throw new BadRequestException(`Items for this request cannot be returned. Status: ${request.status}`);
      }

      // Update item availability
      const itemIdsToUpdate = request.requestItems.map(ri => ri.item_id);
      await tx.item.updateMany({
        where: { item_id: { in: itemIdsToUpdate } },
        data: { is_available: true }
      });

      // Update request status (e.g., to a new "Returned" status or handle as completed)
      // For now, let's assume returning items effectively "completes" the active borrowing period.
      // We don't have a "Returned" status in the schema, so we might consider this as part of closing the request.
      // Or, simply leave the request as 'Success' but items are now available.
      // Let's update to a new status if we add one, or just return the request.
      // For now, we'll just make items available. The request itself remains 'Success'.
      // A more advanced system might have RequestStatus.Returned.

      // Reload request to get updated item statuses if necessary, though not strictly needed here.
      return tx.request.findUnique({
        where: { request_id: requestId },
        include: { requestItems: { include: { item: true } }, user: true, approvals: true }
      });
    });
  }

  // async updateRequestDetails( // Renamed for clarity from generic updateRequestStatus
  //   requestId: string,
  //   dto: UpdateRequestDto, // This DTO should NOT contain status changes to Success/Reject
  //   requestingUserId: string,
  // ): Promise<Request> {
  //   const request = await this.prisma.request.findUnique({
  //     where: { request_id: requestId },
  //   });

  //   if (!request) {
  //     throw new NotFoundException(`Request with ID "${requestId}" not found.`);
  //   }

  //   if (request.user_id !== requestingUserId) {
  //     throw new ForbiddenException('You can only update your own requests.');
  //   }

  //   if (request.status !== RequestStatus.Waiting_Approval) {
  //     throw new BadRequestException(`Only requests with status 'Waiting_Approval' can be modified by the user.`);
  //   }

  //   if (dto.status && (dto.status === RequestStatus.Success || dto.status === RequestStatus.Reject)) {
  //     throw new BadRequestException(`User cannot directly set status to Success or Reject. Use the approval process.`);
  //   }

  //   return this.prisma.request.update({
  //     where: { request_id: requestId },
  //     data: {
  //       // Only allow certain fields to be updated by user, e.g., end_date
  //       end_date: dto.end_date ? new Date(dto.end_date) : request.end_date,
  //       // Do not allow status changes here other than perhaps 'Cancelled_by_User' if such enum existed
  //     },
  //     include: { requestItems: { include: { item: true } }, user: true },
  //   });
  // }


  // for approvals
  
  // for manager
  async findAllApprovals(): Promise<Request[]> {
    // This method retrieves all requests that require approval by the user
    return this.prisma.request.findMany({
      where: {
        status: RequestStatus.Waiting_Manager_Approval,
      },
      include: {
        requestItems: { include: { item: true } },
        user: {
          select: {
            first_name: true,
            last_name: true,
            email_address: true,
            Personal: {
              select: {
                phone_number: true,
              },
            },
          },
        },
      },
      orderBy: { request_date: 'desc' },
    });
  }

  // for pic
  async findAllPicApprovals(userId: string): Promise<Request[]> {
    // This method retrieves all requests that require PIC approval by the user
    return this.prisma.request.findMany({
      where: {
        status: RequestStatus.Waiting_PIC_Approval,
      },
      include: {
        requestItems: { include: { item: true } },
        user: {
          select: {
            first_name: true,
            last_name: true,
            email_address: true,
            Personal: {
              select: {
                phone_number: true,
              },
            },
          },
        },
      },
      orderBy: { request_date: 'desc' },
    });
  }
}
