import { HttpException as DeprecatedHttpException } from './http-exception';
import { messages } from '../constants';
import { Logger } from '@neskjs/common';
import { ExceptionFilterMetadata } from '@neskjs/common/interfaces/exceptions/exception-filter-metadata.interface';
import { isEmpty, isObject } from '@neskjs/common/utils/shared.utils';
import { InvalidExceptionFilterException } from '../errors/exceptions/invalid-exception-filter.exception';
import { HttpException } from '@neskjs/common';

const ERROR_EVENT = 'error';

export class ExceptionsHandler {
  private static readonly logger = new Logger(ExceptionsHandler.name);
  private filters: ExceptionFilterMetadata[] = [];

  public next(exception: Error | HttpException | any, ctx) {
    const { response } = ctx;
    if (this.invokeCustomFilters(exception, ctx)) return;
    if (
      !(
        exception instanceof HttpException ||
        exception instanceof DeprecatedHttpException
      )
    ) {
      response.status = 500
      response.json({
        statusCode: 500,
        message: messages.UNKNOWN_EXCEPTION_MESSAGE,
      });
      ctx.app.emit(ERROR_EVENT, exception, ctx);
      if (isObject(exception) && (exception as Error).message) {
        return ExceptionsHandler.logger.error(
          (exception as Error).message,
          (exception as Error).stack,
        );
      }
      return ExceptionsHandler.logger.error(exception);
    }
    const res = exception.getResponse();
    const message = isObject(res)
      ? res
      : {
          statusCode: exception.getStatus(),
          message: res,
        };
    response.status = exception.getStatus()
    response.json(message);
  }

  public setCustomFilters(filters: ExceptionFilterMetadata[]) {
    if (!Array.isArray(filters)) {
      throw new InvalidExceptionFilterException();
    }
    this.filters = filters;
  }

  public invokeCustomFilters(exception, ctx): boolean {
    if (isEmpty(this.filters)) return false;

    const filter = this.filters.find(({ exceptionMetatypes, func }) => {
      const hasMetatype =
        !exceptionMetatypes.length ||
        !!exceptionMetatypes.find(
          ExceptionMetatype => exception instanceof ExceptionMetatype,
        );
      return hasMetatype;
    });
    filter && filter.func(exception, ctx);
    return !!filter;
  }
}
