import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Профиль разработчика' })
export class Profile {
  @Field(() => ID)
  id: number;

  @Field({ description: 'Имя и фамилия' })
  name: string;

  @Field({ description: 'Должность' })
  position: string;

  @Field({ description: 'Краткое описание о себе' })
  description: string;

  @Field()
  email: string;

  @Field(() => String, { nullable: true, description: 'Город' })
  location: string | null;

  @Field(() => String, { nullable: true })
  githubUrl: string | null;

  @Field(() => String, { nullable: true })
  websiteUrl: string | null;

  @Field(() => String, { nullable: true })
  telegram: string | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
