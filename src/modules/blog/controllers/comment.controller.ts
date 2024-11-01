import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { BlogCommentService } from "../services/comment.service";
import { CreateCommentDto } from "../dto/comment.dto";
import { Pagination } from "src/common/decorators/pagination.decorator";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { AuthDecorator } from "src/common/decorators/auth.decorator";

@Controller("blog-comment")
@ApiTags("blog")
@AuthDecorator()
export class BlogCommentController {
  constructor(private readonly blogCommentService: BlogCommentService) {}

  @Post("/")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  create(@Body() commentDto: CreateCommentDto) {
    return this.blogCommentService.create(commentDto);
  }

  @Get("/")
  @Pagination()
  //   @FilterBlog()
  // @SkipAuth()
  find(
    @Query() paginationDto: PaginationDto
    // @Query() filterBlogDto: FilterBlogDto
  ) {
    return this.blogCommentService.find(paginationDto);
  }

  @Put("/accept/:id")
  accept(@Param("id", ParseIntPipe) id: number) {
    return this.blogCommentService.accept(id);
  }
  @Put("/reject/:id")
  reject(@Param("id", ParseIntPipe) id: number) {
    return this.blogCommentService.reject(id);
  }
}
