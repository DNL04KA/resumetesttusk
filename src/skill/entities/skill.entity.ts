import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SkillCategory } from '../../generated/prisma/enums.js';

registerEnumType(SkillCategory, {
  name: 'SkillCategory',
  description: 'Категория навыка',
});

@ObjectType({ description: 'Навык разработчика' })
export class Skill {
  @Field(() => ID)
  id: number;

  @Field({ description: 'Название технологии' })
  name: string;

  @Field(() => SkillCategory)
  category: SkillCategory;

  @Field(() => Int, { description: 'Уровень владения от 1 до 5' })
  level: number;
}
