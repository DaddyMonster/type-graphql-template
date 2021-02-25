import { Field, InputType, Resolver } from "type-graphql";
import { User } from "../../model-entities/user.entity";
import createPgBaseResolver from "../pg-base-resolver";

@InputType()
class CreateUserInput implements Partial<User> {
  @Field()
  name: string;
}

const UserBaseResolver = createPgBaseResolver({
  suffix: "User",
  mutInput: CreateUserInput,
  objectTypeCls: User,
});

@Resolver(() => User)
export class UserQueryResolver extends UserBaseResolver {}
