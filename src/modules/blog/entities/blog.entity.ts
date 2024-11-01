import { EntityName } from "src/common/enums/entity.enum";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from "typeorm";
import { BlogStatus } from "../enums/status.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { BlogLikeEntity } from "./like.entity";
import { BlogBookmarkEntity } from "./bookmark.entity";
import { BlogCommentEntity } from "./comment.entity";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { BlogCategoryEntity } from "./blog-category.entity";

@Entity(EntityName.Blog)
export class BlogEntity extends BaseEntity {
  @Column()
  title: string;
  @Column()
  description: string;
  @Column()
  content: string;
  @Column({ unique: true })
  slug: string;
  @Column({ nullable: true })
  image: string;
  @Column({ default: BlogStatus.Draft })
  status: string;
  @Column()
  time_for_study: string;
  @Column()
  authorId: number;
  @ManyToOne(() => UserEntity, (user) => user.blogs, { onDelete: "CASCADE" })
  author: UserEntity;
  @OneToMany(() => BlogLikeEntity, (like) => like.blog)
  likes: BlogLikeEntity[];
  @OneToMany(() => BlogBookmarkEntity, (bookmark) => bookmark.blog)
  bookmarks: BlogBookmarkEntity[];
  @OneToMany(() => BlogCommentEntity, (comment) => comment.blog)
  comments: BlogCommentEntity[];
  @OneToMany(() => BlogCategoryEntity, (category) => category.blog)
  categories: BlogCategoryEntity[];
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
