import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

@InputType({ description: 'Поля профиля для обновления. Все необязательны' })
export class UpdateProfileInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'name не может быть пустым' })
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'position не может быть пустым' })
  position?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'email должен быть корректным адресом' })
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'githubUrl должен быть корректным URL' })
  githubUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'websiteUrl должен быть корректным URL' })
  websiteUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  telegram?: string;
}
