import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Проект из портфолио' })
export class Project {
  @Field(() => ID)
  id: number;

  @Field({ description: 'Название проекта' })
  name: string;

  @Field({ description: 'Описание проекта' })
  description: string;

  @Field(() => [String], { description: 'Использованные технологии' })
  technologies: string[];

  @Field(() => String, {
    nullable: true,
    description: 'Ссылка на репозиторий. null — репозиторий недоступен',
  })
  repoUrl: string | null;

  @Field(() => String, {
    nullable: true,
    description: 'Ссылка на демо. null — проект не задеплоен',
  })
  demoUrl: string | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;
}
