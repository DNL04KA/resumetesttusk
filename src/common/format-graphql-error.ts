import type { GraphQLFormattedError } from 'graphql';

/**
 * Исключения Nest (NotFoundException, BadRequestException) несут HTTP-статус,
 * но Apollo про него не знает и помечает любую такую ошибку INTERNAL_SERVER_ERROR.
 * Переводим статус в прикладной код GraphQL и убираем из ответа служебные поля.
 */
const STATUS_TO_CODE: Record<number, string> = {
  400: 'BAD_USER_INPUT',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
};

type NestOriginalError = {
  statusCode?: number;
  message?: string | string[];
};

export function formatGraphQLError(
  error: GraphQLFormattedError,
): GraphQLFormattedError {
  const originalError = error.extensions?.['originalError'] as
    | NestOriginalError
    | undefined;
  const statusCode = originalError?.statusCode;

  const code =
    statusCode === undefined
      ? (error.extensions?.['code'] ?? 'INTERNAL_SERVER_ERROR')
      : (STATUS_TO_CODE[statusCode] ?? 'INTERNAL_SERVER_ERROR');

  // ValidationPipe складывает список нарушений в originalError.message,
  // а сверху оставляет бесполезное "Bad Request Exception".
  const validationErrors = Array.isArray(originalError?.message)
    ? originalError.message
    : undefined;

  return {
    message: validationErrors?.join('; ') ?? error.message,
    path: error.path,
    locations: error.locations,
    extensions: validationErrors ? { code, validationErrors } : { code },
  };
}
