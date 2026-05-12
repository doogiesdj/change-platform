import { Controller, Get, Patch, Post, Param, Body, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator';

@Controller('admin')
@Roles('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Roles('admin', 'moderator')
  @Get('dashboard/overview')
  getDashboardOverview() {
    return this.adminService.getDashboardOverview();
  }

  @Roles('admin', 'moderator')
  @Get('dashboard/signatures')
  getDashboardSignatures() {
    return this.adminService.getDashboardSignatures();
  }

  @Roles('admin', 'moderator')
  @Get('dashboard/donations')
  getDashboardDonations() {
    return this.adminService.getDashboardDonations();
  }

  @Roles('admin', 'moderator')
  @Get('dashboard/petitions')
  getDashboardPetitions() {
    return this.adminService.getDashboardPetitions();
  }

  @Get('users')
  findUsers(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.adminService.findUsers(Number(page), Number(limit));
  }

  @Patch('users/:id/role')
  updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() actor: CurrentUserPayload,
  ) {
    return this.adminService.updateUserRole(id, dto.role, actor.id);
  }

  @Get('audit-logs')
  getAuditLogs(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    return this.adminService.getAuditLogs(Number(page), Number(limit));
  }

  @Post('reclassify')
  reclassifyAll() {
    return this.adminService.reclassifyAll();
  }
}
