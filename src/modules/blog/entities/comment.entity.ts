import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { BlogEntity } from "./blog.entity";

@Entity(EntityName.BlogComments)
export class BlogCommentEntity extends BaseEntity {
  @Column()
  text: string;
  @Column({ default: false })
  accepted: boolean;
  @Column()
  blogId: number;
  @Column()
  userId: number;
  @ManyToOne(() => UserEntity, (user) => user.blog_comments, {
    onDelete: "CASCADE",
  })
  user: UserEntity;

  @ManyToOne(() => BlogEntity, (blog) => blog.comments, {
    onDelete: "CASCADE",
  })
  blog: BlogEntity;
  @Column({ nullable: true })
  parentId: number;
  @ManyToOne(() => BlogCommentEntity, (parent) => parent.children)
  parent: BlogCommentEntity;
  @OneToMany(() => BlogCommentEntity, (parent) => parent.parent)
  @JoinColumn({ name: "parent" })
  children: BlogCommentEntity[];
  @CreateDateColumn()
  createdAt: Date;
}
