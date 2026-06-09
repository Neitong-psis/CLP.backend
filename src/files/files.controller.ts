import {
  Controller,
  Get,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FilesService } from './files.service';
import { FileType } from './domain/file';

@ApiTags('Files')
@Controller({
  path: 'files',
  version: '1',
})
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: FileType,
  })
  async findOne(@Param('id') id: string) {
    const file = await this.filesService.findById(id);
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
    return {
      file,
    };
  }
}
