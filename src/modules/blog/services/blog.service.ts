import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogEntity } from "../entities/blog.entity";
import { DataSource, FindOptionsWhere, Repository } from "typeorm";
import { CreateBlogDto, FilterBlogDto, UpdateBlogDto } from "../dto/blog.dto";
import { createSlug, randomId } from "src/common/utils/function.utils";
import { BlogStatus } from "../enums/status.enum";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import {
  BadRequestMessage,
  NotFoundMessage,
  PublicMessage,
} from "src/common/enums/message.enum";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import {
  paginationGenerator,
  PaginationSolver,
} from "src/common/utils/pagination.util";
import { isArray } from "class-validator";
import { CategoryService } from "../../category/category.service";
import { BlogCategoryEntity } from "../entities/blog-category.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { BlogLikeEntity } from "../entities/like.entity";
import { BlogBookmarkEntity } from "../entities/bookmark.entity";
import { BlogCommentService } from "./comment.service";

@Injectable({ scope: Scope.REQUEST })
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
    @InjectRepository(BlogCategoryEntity)
    private blogCategoryRepository: Repository<BlogCategoryEntity>,
    @InjectRepository(BlogLikeEntity)
    private blogLikeRepository: Repository<BlogLikeEntity>,
    @InjectRepository(BlogBookmarkEntity)
    private blogBookmarkRepository: Repository<BlogBookmarkEntity>,
    private categoryService: CategoryService,

    private blogCommentService: BlogCommentService,
    @Inject(REQUEST) private request: Request,
    private dataSource: DataSource
  ) {}
  async create(blogDto: CreateBlogDto) {
    const { user } = this.request;
    let {
      title,
      slug,
      content,
      description,
      image,
      time_for_study,
      categories,
    } = blogDto;
    //? change string categories to array
    if (!isArray(categories) && typeof categories === "string") {
      categories = categories.split(",");
    } else if (!isArray(categories)) {
      throw new BadRequestException(BadRequestMessage.InvalidCategories);
    }
    //?create slug for blog
    let slugData = slug ?? title;
    slug = createSlug(slugData);
    const isExist = await this.checkBlogBySlug(slug);
    if (isExist) {
      slug = slug + `-${randomId()}`;
    }
    //?create blog
    let blog = this.blogRepository.create({
      title,
      slug,
      content,
      description,
      image,
      time_for_study,
      status: BlogStatus.Draft,
      authorId: user.id,
    });
    blog = await this.blogRepository.save(blog);
    //? Create blog categories
    for (let categoryTitle of categories) {
      categoryTitle = categoryTitle?.trim()?.toLowerCase();
      let category = await this.categoryService.findOneByTitle(categoryTitle);
      if (!category) {
        category = await this.categoryService.InsertByTitle(categoryTitle);
      }
      await this.blogCategoryRepository.insert({
        blogId: blog.id,
        categoryId: category.id,
      });
    }
    return { message: PublicMessage.Created };
  }

  async checkBlogBySlug(slug: string) {
    const blog = await this.blogRepository.findOneBy({ slug });
    return blog;
  }
  async checkBlogById(id: number) {
    const blog = await this.blogRepository.findOneBy({ id });
    if (!blog) throw new NotFoundException(NotFoundMessage.NotFoundPost);
    return blog;
  }
  async myBlogs() {
    const { id } = this.request.user;
    return this.blogRepository.find({
      relations: {
        categories: {
          category: true,
        },
      },
      where: {
        authorId: id,
      },
      select: {
        categories: {
          id: true,
          category: {
            title: true,
          },
        },
      },
      order: {
        id: "DESC",
      },
    });
  }

  async blogList(paginationDto: PaginationDto, filterDto: FilterBlogDto) {
    const { limit, skip, page } = PaginationSolver(paginationDto);
    let { category, search } = filterDto;
    let where = "";
    if (category) {
      category = category.toLowerCase();
      if (where.length > 0) where += " AND ";
      where += "category.title = LOWER(:category)";
    }
    if (search) {
      if (where.length > 0) where += " AND ";
      search = `%${search}%`;
      where += "CONCAT(blog.title,blog.description,blog.content) ILIKE :search";
    }
    const [blogs, count] = await this.blogRepository
      .createQueryBuilder(EntityName.Blog)
      .leftJoin("blog.categories", "categories")
      .leftJoin("blog.author", "author")
      .leftJoin("author.profile", "profile")
      .leftJoin("categories.category", "category")
      .addSelect([
        "categories.id",
        "category.title",
        "author.id",
        "author.username",
        "profile.nick_name",
      ])
      .where(where, { category, search })
      .loadRelationCountAndMap("blog.likes", "blog.likes")
      .loadRelationCountAndMap("blog.bookmarks", "blog.bookmarks")
      .loadRelationCountAndMap(
        "blog.comments",
        "blog.comments",
        "comments",
        (qb) => qb.where("comments.accepted =:accepted", { accepted: true })
      )
      .orderBy("blog.id", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    // let where: FindOptionsWhere<BlogEntity> = {};
    // if (category) {
    //   where["categories"] = {
    //     category: {
    //       title: category,
    //     },
    //   };
    // }
    // const [blogs, count] = await this.blogRepository.findAndCount({
    //   relations: {
    //     categories: {
    //       category: true,
    //     },
    //   },
    //   where,
    //   select: {
    //     categories: {
    //       id: true,
    //       category: {
    //         title: true,
    //       },
    //     },
    //   },
    //   order: {
    //     id: "DESC",
    //   },
    //   skip,
    //   take: limit,
    // });
    return {
      pagination: paginationGenerator(count, page, limit),
      blogs,
    };
  }

  async delete(id: number) {
    const { id: userId } = this.request.user;
    const blog = await this.checkBlogById(id);
    if (blog.authorId !== userId) {
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    }
    await this.blogRepository.delete(id);
    return {
      message: PublicMessage.Deleted,
    };
  }

  async update(id: number, blogDto: UpdateBlogDto) {
    const { id: userId } = this.request.user;
    let {
      title,
      slug,
      content,
      description,
      image,
      time_for_study,
      categories,
    } = blogDto;
    let blog = await this.checkBlogById(id);
    if (blog.authorId !== userId) {
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    }
    //? change string categories to array
    if (!isArray(categories) && typeof categories === "string") {
      categories = categories.split(",");
    } else if (!isArray(categories)) {
      throw new BadRequestException(BadRequestMessage.InvalidCategories);
    }

    let slugData = null;
    if (title) {
      slugData = title;
      blog.title = title;
    }
    if (slug) slugData = slug;
    if (slugData) {
      slug = createSlug(slugData);
      const isExist = await this.checkBlogBySlug(slug);
      if (isExist && isExist.id !== id) {
        slug = slug + `-${randomId()}`;
      }
      blog.slug = slug;
    }
    if (content) blog.content = content;
    if (description) blog.description = description;
    if (image) blog.image = image;
    if (time_for_study) blog.time_for_study = time_for_study;
    blog = await this.blogRepository.save(blog);
    await this.blogCategoryRepository.delete({ blogId: blog.id });
    if (categories && isArray(categories) && categories.length > 0) {
      await this.blogCategoryRepository.delete({ blogId: blog.id });
    }
    for (let categoryTitle of categories) {
      categoryTitle = categoryTitle?.trim()?.toLowerCase();
      let category = await this.categoryService.findOneByTitle(categoryTitle);
      if (!category) {
        category = await this.categoryService.InsertByTitle(categoryTitle);
      }
      await this.blogCategoryRepository.insert({
        blogId: blog.id,
        categoryId: category.id,
      });
    }
    return { message: PublicMessage.Updated };
  }

  async likeToggle(blogId: number) {
    const { id: userId } = this.request.user;
    await this.checkBlogById(blogId);
    const isLiked = await this.blogLikeRepository.findOneBy({ userId, blogId });
    let message = PublicMessage.Like;
    if (isLiked) {
      await this.blogLikeRepository.delete({ id: isLiked.id });
      message = PublicMessage.DisLike;
    } else {
      await this.blogLikeRepository.insert({ blogId, userId });
    }
    return {
      message,
    };
  }
  async bookmarkToggle(blogId: number) {
    const { id: userId } = this.request.user;
    await this.checkBlogById(blogId);
    const isBookmarked = await this.blogBookmarkRepository.findOneBy({
      userId,
      blogId,
    });
    let message = PublicMessage.Bookmark;
    if (isBookmarked) {
      await this.blogBookmarkRepository.delete({ id: isBookmarked.id });
      message = PublicMessage.UnBookmark;
    } else {
      await this.blogBookmarkRepository.insert({ blogId, userId });
    }
    return {
      message,
    };
  }
  async findOneBySlug(slug: string, paginationDto: PaginationDto) {
    const userId = this.request?.user?.id;
    const blog = await this.blogRepository
      .createQueryBuilder(EntityName.Blog)
      .leftJoin("blog.categories", "categories")
      .leftJoin("blog.author", "author")
      .leftJoin("author.profile", "profile")
      .leftJoin("categories.category", "category")
      .addSelect([
        "categories.id",
        "category.title",
        "author.id",
        "author.username",
        "profile.nick_name",
      ])
      .where({ slug })
      .loadRelationCountAndMap("blog.likes", "blog.likes")
      .loadRelationCountAndMap("blog.bookmarks", "blog.bookmarks")

      .getOne();
    if (!blog) throw new NotFoundException(NotFoundMessage.NotFoundPost);
    const commentsData = await this.blogCommentService.findCommentsOfBlog(
      blog.id,
      paginationDto
    );
    let isLiked = false;
    let isBookmarked = false;
    if (userId && !isNaN(userId) && userId > 0) {
      isLiked = !!(await this.blogLikeRepository.findOneBy({
        userId,
        blogId: blog.id,
      }));
      isBookmarked = !!(await this.blogBookmarkRepository.findOneBy({
        userId,
        blogId: blog.id,
      }));
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    //TODO virtual entity
    //TODO json_build_object
    //TODO array_agg
    const suggestBlogs = await queryRunner.query(`
        WITH suggested_blogs AS (
          SELECT 
          blog.id ,
          blog.title ,
          blog.slug ,
          blog.description ,
          blog.time_for_study ,
          blog.image,
          json_build_object(
          'username', u.username,
          'author_name', p.nick_name,
          'image', p.image_profile
          ) AS author,
           array_agg(DISTINCT cat.title) AS categories,
          (
          SELECT COUNT(*) FROM blog_likes
          WHERE blog_likes."blogId" = blog.id
          ) AS likes,
          (
          SELECT COUNT(*) FROM blog_bookmarks
          WHERE blog_bookmarks."blogId" = blog.id
          ) AS bookmark,
          (
          SELECT COUNT(*) FROM blog_comments
          WHERE blog_comments."blogId" = blog.id
          ) AS comments

          FROM  blog
          LEFT JOIN public.user u ON blog."authorId" = u.id
          LEFT JOIN profile p ON p."userId" = u.id
          LEFT JOIN blog_category bc ON blog.id = bc."blogId"
          LEFT JOIN category cat ON  bc."categoryId" = cat.id
          GROUP BY blog.id, u.username, p.nick_name ,p.image_profile
          ORDER BY RANDOM()
          LIMIT 3

        )
        SELECT * FROM suggested_blogs

      `);
    return {
      blog,
      isLiked,
      isBookmarked,
      commentsData,
      suggestBlogs,
    };
  }
}
