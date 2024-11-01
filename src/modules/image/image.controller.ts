import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { ImageService } from "./image.service";
import { ImageDto } from "./dto/image.dto";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/guards/auth.guard";
import { AuthDecorator } from "src/common/decorators/auth.decorator";
import { UploadFile } from "src/common/interceptors/upload.interceptor";
import { multerFile } from "src/common/utils/multer.util";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";

@Controller("image")
@ApiTags("image")
@AuthDecorator()
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post()
  @UseInterceptors(UploadFile("image"))
  @ApiConsumes(SwaggerConsumes.MultipartData)
  create(@Body() imageDto: ImageDto, @UploadedFile() image: multerFile) {
    return this.imageService.create(imageDto, image);
  }

  @Get()
  findAll() {
    return this.imageService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.imageService.findOne(+id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.imageService.remove(+id);
  }
}
