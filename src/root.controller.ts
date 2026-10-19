import { Controller, Get, Redirect } from '@nestjs/common';

/**
 * У GraphQL-API единственная точка входа — /graphql.
 * Корень перенаправляет туда, чтобы базовая ссылка не отдавала 404.
 */
@Controller()
export class RootController {
  @Get()
  @Redirect('/graphql', 302)
  redirectToSandbox(): void {}
}
