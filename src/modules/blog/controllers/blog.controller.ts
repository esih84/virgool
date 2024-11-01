import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { BlogService } from "../services/blog.service";
import { CreateBlogDto, FilterBlogDto, UpdateBlogDto } from "../dto/blog.dto";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { Pagination } from "src/common/decorators/pagination.decorator";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { SKIP_AUTH, SkipAuth } from "src/common/decorators/skip-auth.decorator";
import { FilterBlog } from "src/common/decorators/filter.decorator";
import { AuthDecorator } from "src/common/decorators/auth.decorator";

@Controller("blog")
@ApiTags("blog")
@AuthDecorator()
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post("/")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  create(@Body() blogDto: CreateBlogDto) {
    return this.blogService.create(blogDto);
  }
  @Get("/my")
  myBlogs() {
    return this.blogService.myBlogs();
  }

  @Get("/")
  @Pagination()
  @FilterBlog()
  // @SkipAuth()
  @SkipAuth(SKIP_AUTH)
  find(
    @Query() paginationDto: PaginationDto,
    @Query() filterBlogDto: FilterBlogDto
  ) {
    return this.blogService.blogList(paginationDto, filterBlogDto);
  }

  @Delete("/:id")
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.blogService.delete(id);
  }
  @Put("/:id")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() blogDto: UpdateBlogDto
  ) {
    return this.blogService.update(id, blogDto);
  }
  @Get("/like/:id")
  likeToggle(@Param("id", ParseIntPipe) id: number) {
    return this.blogService.likeToggle(id);
  }
  @Get("/bookmark/:id")
  bookmarkToggle(@Param("id", ParseIntPipe) id: number) {
    return this.blogService.bookmarkToggle(id);
  }
  @Get("/by-slug/:slug")
  @SkipAuth(SKIP_AUTH)
  @Pagination()
  findOneBySlug(
    @Param("slug") slug: string,
    @Query() paginationDto: PaginationDto
  ) {
    return this.blogService.findOneBySlug(slug, paginationDto);
  }
}
