import { ReturnModelType } from "@typegoose/typegoose";
import { Arg, ClassType, ID, Mutation, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import {
  CreatePgBaseResolverOptions,
  mapKeyValueArgs,
  SimpleKeyValueArgs,
  UpdaterArgs,
} from "./pg-base-resolver";

interface CreateMgBaseResolverArgs<T extends ClassType>
  extends CreatePgBaseResolverOptions<T> {
  Model: ReturnModelType<T>;
}

export default function createMgBaseResolver<T extends ClassType>({
  Model,
  mutInput,
  objectTypeCls,
  suffix,
}: CreateMgBaseResolverArgs<T>) {
  @Resolver(() => objectTypeCls, { isAbstract: true })
  abstract class MgBaseResolver {
    @Query(() => [objectTypeCls], { name: `getAll${suffix}` })
    async getAll() {
      return await Model.find();
    }

    @Query(() => [objectTypeCls], { name: `find${suffix}byId` })
    async findById(@Arg("id", () => ID) id: string) {
      const item = await Model.findById(id);
      if (!item) {
        throw new Error();
      }
      return item;
    }
    @Query(() => [objectTypeCls], { name: `find${suffix}sByIds` })
    async findByIds(@Arg("ids", () => [ID]) ids: string[]) {
      return await Model.findById(ids);
    }

    @Query(() => objectTypeCls, { name: `findOne${suffix}` })
    async findOne(
      @Arg("input", () => SimpleKeyValueArgs) _args: SimpleKeyValueArgs<T>[]
    ) {
      const args = mapKeyValueArgs(_args);
      const doc = await Model.findOne(args as any);
      if (!doc) {
        throw new Error();
      }
    }

    @Query(() => objectTypeCls, { name: `findMany${suffix}s` })
    async findMany(
      @Arg("input", () => SimpleKeyValueArgs) _args: SimpleKeyValueArgs<T>[]
    ) {
      const args = mapKeyValueArgs(_args);
      return await Model.find(args as any);
    }

    @Mutation(() => Boolean)
    async update(@Arg("input", () => UpdaterArgs) updateArgs: UpdaterArgs<T>) {
      try {
        const where = mapKeyValueArgs(updateArgs.where);
        const updater = mapKeyValueArgs(updateArgs.updater);
        await Model.update(where as any, updater as any);
        return true;
      } catch (err) {
        console.log(err);
        throw new Error();
      }
    }

    @Mutation(() => objectTypeCls)
    async create(@Arg("input", () => mutInput) modelInput: typeof mutInput) {
      try {
        return await Model.create(modelInput as any);
      } catch (err) {
        throw new Error();
      }
    }

    @Mutation(() => Boolean, { name: `remove${suffix}ById` })
    async removeById(@Arg("id") id: string) {
      return await Model.findByIdAndDelete(id);
    }
    @Mutation(() => Boolean, { name: `remove${suffix}sByIds` })
    async removeManyByIds(@Arg("ids") ids: string[]) {
      return await Model.findByIdAndDelete(ids);
    }
    @Mutation(() => Boolean, { name: `remove${suffix}By` })
    async removeBy(
      @Arg("input", () => SimpleKeyValueArgs) _args: SimpleKeyValueArgs<T>[]
    ) {
      const args = mapKeyValueArgs(_args);
      return await Model.deleteOne(args as any);
    }
    @Mutation(() => Boolean, { name: `removeMany${suffix}By` })
    async removeManyBy(
      @Arg("input", () => SimpleKeyValueArgs) _args: SimpleKeyValueArgs<T>[]
    ) {
      const args = mapKeyValueArgs(_args);
      return await Model.deleteMany(args as any);
    }
  }
  return MgBaseResolver;
}
