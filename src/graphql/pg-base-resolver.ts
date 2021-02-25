import {
  Arg,
  ClassType,
  Field,
  ID,
  InputType,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { getRepository, In } from "typeorm";

@InputType()
export class SimpleKeyValueArgs<T extends Object> {
  @Field(() => String)
  key: keyof T;

  @Field()
  value: string;
}

@InputType()
export class UpdaterArgs<T extends Object> {
  @Field(() => [SimpleKeyValueArgs])
  where: SimpleKeyValueArgs<T>[];

  @Field(() => [SimpleKeyValueArgs])
  updater: SimpleKeyValueArgs<T>[];
}

export interface CreatePgBaseResolverOptions<T extends ClassType> {
  suffix: string;
  objectTypeCls: T;
  mutInput: ClassType;
}

export function mapKeyValueArgs<T extends object>(
  args: SimpleKeyValueArgs<T>[]
): { [key: string]: any } {
  return args.reduce(
    (acc, cur) => Object.assign(acc, { [cur.key]: JSON.parse(cur.value) }),
    {}
  );
}

export default function createPgBaseResolver<T extends ClassType>({
  objectTypeCls,
  suffix,
  mutInput,
}: CreatePgBaseResolverOptions<T>) {
  @Resolver(() => objectTypeCls, { isAbstract: true })
  abstract class BasePgResolver {
    @Query(() => [objectTypeCls], { name: `getAll${suffix}` })
    async getAll() {
      return await getRepository(objectTypeCls).find();
    }

    @Query(() => objectTypeCls, { name: `find${suffix}ById` })
    async findById(
      @Arg("id", () => ID) id: number
    ): Promise<typeof objectTypeCls> {
      return await getRepository(objectTypeCls).findOneOrFail({
        where: { id },
      });
    }

    @Query(() => [objectTypeCls], { name: `find${suffix}sByIds` })
    async findManyByIds(@Arg("ids", () => [ID]) ids: number[]) {
      return await getRepository(objectTypeCls).findByIds(ids);
    }

    @Query(() => [objectTypeCls], { name: `findMany${suffix}` })
    async findMany(
      @Arg("input", () => [SimpleKeyValueArgs])
      _args: [SimpleKeyValueArgs<T>]
    ) {
      const args = mapKeyValueArgs(_args);
      return await getRepository(objectTypeCls).find({ where: args });
    }

    @Query(() => objectTypeCls, { name: `findOne${suffix}` })
    async findOne(
      @Arg("input", () => [SimpleKeyValueArgs])
      _args: [SimpleKeyValueArgs<T>]
    ) {
      const args = mapKeyValueArgs(_args);
      return await getRepository(objectTypeCls).findOneOrFail({
        where: args,
      });
    }

    @Mutation(() => objectTypeCls, { name: `create${suffix}` })
    async create(@Arg("input", () => mutInput) mutationInput: typeof mutInput) {
      const newUser = await getRepository(objectTypeCls)
        .create(mutationInput)
        .save();
      return newUser;
    }

    @Mutation(() => Boolean, { name: `updateOne${suffix}` })
    async update(@Arg("input", () => [UpdaterArgs]) _args: UpdaterArgs<T>) {
      const where = mapKeyValueArgs(_args.where);
      const updater = mapKeyValueArgs(_args.updater);
      await getRepository(objectTypeCls).update(where, updater);
      return true;
    }

    @Mutation(() => Boolean, { name: `removeOne${suffix}ById` })
    async removeOneById(@Arg("id", () => ID) id: number) {
      return await this.remover({ id });
    }
    @Mutation(() => Boolean, { name: `removeMany${suffix}ByIds` })
    async removeManyByIds(@Arg("ids", () => [ID]) ids: number[]) {
      return await this.remover({ id: In(ids) });
    }
    @Mutation(() => Boolean, { name: `remove${suffix}By` })
    async removeBy(
      @Arg("input", () => [SimpleKeyValueArgs]) _args: SimpleKeyValueArgs<T>[]
    ) {
      const args = mapKeyValueArgs(_args);
      return this.remover(args);
    }
    private async remover(cond: any) {
      await getRepository(objectTypeCls).delete(cond);
      return true;
    }
  }
  return BasePgResolver;
}
