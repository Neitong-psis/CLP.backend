import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { SyncCurriculumDto } from './dto/sync-curriculum.dto';
import { QueryCourseDto } from './dto/query-course.dto';
import { Course } from './domain/course';
import { infinityPagination } from '../utils/infinity-pagination';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RejectCourseDto } from './dto/reject-course.dto';
import { RolesGuard } from '../roles/roles.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { SyncCurriculumResponseDto } from './dto/sync-curriculum-response.dto';
import { CurriculumModuleDto } from './dto/curriculum-response.dto';
import { isUUID } from 'class-validator';
import { ApproveCourseDto } from './dto/approve-course.dto';
import { CourseStatusEnum } from './course-status.enum';

@ApiTags('Courses')
@Controller({
  path: 'courses',
  version: '1',
})
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.educator)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  @ApiCreatedResponse({ type: Course })
  create(@Request() req, @Body() createCourseDto: CreateCourseDto) {
    const user = req.user;
    const isAdmin = user.roles.some((role) => role.id === RoleEnum.admin);
    if (!isAdmin || !createCourseDto.instructorId) {
      createCourseDto.instructorId = user.id;
    }
    return this.coursesService.create(createCourseDto, user);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  @ApiOkResponse({ type: [Course] })
  async findAll(@Request() req, @Query() query: QueryCourseDto) {
    const page = query.page ?? 1;
    let limit = query.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }
    const isAdmin = this.isAdmin(req.user);
    return infinityPagination(
      await this.coursesService.findManyWithPagination({
        paginationOptions: {
          page,
          limit,
        },
        filterOptions: {
          search: query.search,
          instructorId: query.instructorId,
          categoryId: query.categoryId,
          // Only admins may browse drafts/under-review/archived courses.
          // Everyone else (public catalog, learners, educators browsing
          // other instructors' courses) only ever sees published courses.
          status: isAdmin ? query.status : [CourseStatusEnum.PUBLISHED],
        },
      }),
      { page, limit },
    );
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('stats')
  async getStats() {
    return this.coursesService.getStats();
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('top-performing')
  async getTopPerforming() {
    return this.coursesService.getTopPerforming();
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/content')
  @ApiOkResponse({ type: Object })
  async getContent(@Request() req, @Param('id') id: string) {
    if (!isUUID(id)) {
      throw new NotFoundException(`Course ${id} not found`);
    }
    await this.assertViewable(id, req.user);
    return this.coursesService.getContent(id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/curriculum')
  @ApiOkResponse({ type: [CurriculumModuleDto] })
  async getCurriculum(
    @Request() req,
    @Param('id') id: string,
  ): Promise<CurriculumModuleDto[]> {
    if (!isUUID(id)) {
      throw new NotFoundException(`Course ${id} not found`);
    }
    await this.assertViewable(id, req.user);
    return this.coursesService.getCurriculum(id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  @ApiOkResponse({ type: Course })
  async findOne(@Request() req, @Param('id') id: string) {
    if (!isUUID(id)) {
      throw new NotFoundException(`Course ${id} not found`);
    }
    const course = await this.coursesService.findOne(id);
    if (!this.canView(course, req.user)) {
      throw new NotFoundException(`Course ${id} not found`);
    }
    return course;
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.educator)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post(':id/curriculum')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SyncCurriculumResponseDto })
  async syncCurriculum(
    @Request() req,
    @Param('id') id: string,
    @Body() syncCurriculumDto: SyncCurriculumDto,
  ) {
    if (!isUUID(id)) {
      throw new NotFoundException(`Course ${id} not found`);
    }
    const user = req.user;
    const isAdmin = user.roles.some((role) => role.id === RoleEnum.admin);
    if (!isAdmin) {
      const course = await this.coursesService.findOne(id);
      if (!course) {
        throw new NotFoundException(`Course ${id} not found`);
      }
      if (course.instructor.id !== user.id) {
        throw new ForbiddenException(
          'You are not allowed to update curriculum for this course',
        );
      }
    }
    return this.coursesService.syncCurriculum(id, syncCurriculumDto, user);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.educator)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch(':id')
  @ApiOkResponse({ type: Course })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    if (!isUUID(id)) {
      throw new NotFoundException(`Course ${id} not found`);
    }
    const user = req.user;
    const isAdmin = user.roles.some((role) => role.id === RoleEnum.admin);
    if (!isAdmin) {
      const course = await this.coursesService.findOne(id);
      if (course.instructor.id !== user.id) {
        throw new ForbiddenException(
          'You are not allowed to update this course',
        );
      }
      updateCourseDto.instructorId = user.id;
    }
    return this.coursesService.update(id, updateCourseDto, user);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.educator)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  @ApiOkResponse()
  async remove(@Request() req, @Param('id') id: string) {
    if (!isUUID(id)) {
      throw new NotFoundException(`Course ${id} not found`);
    }
    const user = req.user;
    const isAdmin = user.roles.some((role) => role.id === RoleEnum.admin);
    if (!isAdmin) {
      const course = await this.coursesService.findOne(id);
      if (course.instructor.id !== user.id) {
        throw new ForbiddenException(
          'You are not allowed to delete this course',
        );
      }
    }
    return this.coursesService.remove(id, user);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.educator)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post(':id/submit-for-review')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: Course })
  async submitForReview(@Request() req, @Param('id') id: string) {
    if (!isUUID(id)) {
      throw new NotFoundException(`Course ${id} not found`);
    }
    const user = req.user;
    const isAdmin = user.roles.some((role) => role.id === RoleEnum.admin);
    if (!isAdmin) {
      const course = await this.coursesService.findOne(id);
      if (course.instructor.id !== user.id) {
        throw new ForbiddenException(
          'You are not allowed to submit this course for review',
        );
      }
    }
    return this.coursesService.submitForReview(id);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: Course })
  async approve(
    @Request() req,
    @Param('id') id: string,
    @Body() approveCourseDto: ApproveCourseDto,
  ) {
    if (!isUUID(id)) {
      throw new NotFoundException(`Course ${id} not found`);
    }
    return this.coursesService.approve(id, req.user, approveCourseDto.feedback);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: Course })
  async reject(
    @Request() req,
    @Param('id') id: string,
    @Body() rejectCourseDto: RejectCourseDto,
  ) {
    if (!isUUID(id)) {
      throw new NotFoundException(`Course ${id} not found`);
    }
    return this.coursesService.reject(id, rejectCourseDto.feedback, req.user);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.educator)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: Course })
  async archive(@Request() req, @Param('id') id: string) {
    if (!isUUID(id)) {
      throw new NotFoundException(`Course ${id} not found`);
    }
    const user = req.user;
    const isAdmin = user.roles.some((role) => role.id === RoleEnum.admin);
    if (!isAdmin) {
      const course = await this.coursesService.findOne(id);
      if (course.instructor.id !== user.id) {
        throw new ForbiddenException(
          'You are not allowed to archive this course',
        );
      }
    }
    return this.coursesService.archive(id);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.educator)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: Course })
  async restore(@Request() req, @Param('id') id: string) {
    if (!isUUID(id)) {
      throw new NotFoundException(`Course ${id} not found`);
    }
    const user = req.user;
    const isAdmin = user.roles.some((role) => role.id === RoleEnum.admin);
    if (!isAdmin) {
      const course = await this.coursesService.findOne(id);
      if (course.instructor.id !== user.id) {
        throw new ForbiddenException(
          'You are not allowed to restore this course',
        );
      }
    }
    return this.coursesService.restore(id);
  }

  /** True if `user` is an admin. */
  private isAdmin(user?: { roles?: { id: unknown }[] }): boolean {
    return user?.roles?.some((role) => role.id === RoleEnum.admin) ?? false;
  }

  /** Published courses are visible to everyone; drafts/under-review/archived
   *  courses are only visible to admins and the owning instructor. */
  private canView(
    course: Course,
    user?: { id?: unknown; roles?: { id: unknown }[] },
  ): boolean {
    if (course.status === CourseStatusEnum.PUBLISHED) {
      return true;
    }
    if (!user) {
      return false;
    }
    return this.isAdmin(user) || course.instructor?.id === user.id;
  }

  /** Throws NotFoundException if `user` may not view course `id`. */
  private async assertViewable(id: string, user?: unknown): Promise<void> {
    const course = await this.coursesService.findOne(id);
    const viewer = user as { id?: unknown; roles?: { id: unknown }[] };
    if (!this.canView(course, viewer)) {
      throw new NotFoundException(`Course ${id} not found`);
    }
  }
}
