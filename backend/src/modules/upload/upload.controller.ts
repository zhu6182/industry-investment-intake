import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService, UploadedFileInfo } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

const ALL_ROLES = [
  'admin',
  'middleware_ops',
  'investment_manager',
  'investment_staff',
  'channel_manager',
  'channel_specialist',
];

@Controller('api/upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...ALL_ROLES)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadedFileInfo> {
    return this.uploadService.saveFile(file);
  }

  @Post('files')
  @UseInterceptors(FilesInterceptor('files', 20))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<UploadedFileInfo[]> {
    return this.uploadService.saveFiles(files);
  }
}
