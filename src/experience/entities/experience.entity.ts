import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Место работы' })
export class Experience {
  @Field(() => ID)
  id: number;

  @Field({ description: 'Название компании' })
  company: string;

  @Field({ description: 'Должность' })
  position: string;

  @Field(() => String, { nullable: true, description: 'Чем занимался' })
  description: string | null;

  @Field(() => [String], { description: 'Достижения на этом месте работы' })
  achievements: string[];

  @Field(() => GraphQLISODateTime, { description: 'Дата начала работы' })
  startDate: Date;

  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: 'Дата окончания. null — работает по настоящее время',
  })
  endDate: Date | null;
}
