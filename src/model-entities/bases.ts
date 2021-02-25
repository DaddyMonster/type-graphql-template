import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@ObjectType()
export abstract class IdEntity extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;
}

@ObjectType()
export abstract class DateIdEntity extends IdEntity {
  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;
}
