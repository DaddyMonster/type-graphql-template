import { Field, ID, ObjectType } from "type-graphql";
import { TypeormLoader } from "type-graphql-dataloader";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { DateIdEntity } from "./bases";
import { User } from "./user.entity";

@ObjectType()
@Entity()
export class Post extends DateIdEntity {
  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  description: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.posts)
  @TypeormLoader(() => User, (post: Post) => post.creatorId)
  creator: User;

  @Field(() => ID)
  @Column()
  creatorId: number;
}
