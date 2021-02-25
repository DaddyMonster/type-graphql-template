import { Post } from "../../model-entities/post.entity";
import { Field, ID, InputType, Resolver } from "type-graphql";
import createPgBaseResolver from "../pg-base-resolver";

@InputType()
class CreatePostInput implements Partial<Post> {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => ID)
  creatorId: number;
}

const PostBaseResolver = createPgBaseResolver({
  mutInput: CreatePostInput,
  objectTypeCls: Post,
  suffix: "Post",
});

@Resolver()
export class PostResolver extends PostBaseResolver {}
