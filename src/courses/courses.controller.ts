import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
  Request,
  ForbiddenException,
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
import { Course } from './domain/course';
import { infinityPagination } from '../utils/infinity-pagination';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';

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
    if (!isAdmin) {
      createCourseDto.instructorId = user.id;
    }
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @ApiOkResponse({ type: [Course] })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    if (limit > 50) {
      limit = 50;
    }
    return infinityPagination(
      await this.coursesService.findManyWithPagination({
        page,
        limit,
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

  @Get(':id/content')
  @ApiOkResponse({ type: Object })
  getContent(@Param('id') id: string) {
    return this.coursesService.getContent(id);
  }

  @Get(':id')
  @ApiOkResponse({ type: Course })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
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
    return this.coursesService.update(id, updateCourseDto);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.educator)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  @ApiOkResponse()
  async remove(@Request() req, @Param('id') id: string) {
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
    return this.coursesService.remove(id);
  }
}
