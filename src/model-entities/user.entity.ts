import { Field, ObjectType } from "type-graphql";
import { TypeormLoader } from "type-graphql-dataloader";
import { Column, Entity, OneToMany, RelationId } from "typeorm";
import { DateIdEntity } from "./bases";
import { Post } from "./post.entity";

@ObjectType()
@Entity()
export class User extends DateIdEntity {
  @Field()
  @Column()
  name: string;

  @Field(() => [Post])
  @OneToMany(() => Post, (post) => post.creator)
  @TypeormLoader(() => Post, (user: User) => user.postIds)
  posts: Post[];

  @RelationId((user: User) => user.posts)
  postIds: number[];
}
