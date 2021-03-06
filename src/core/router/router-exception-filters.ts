import 'reflect-metadata';
import iterate from 'iterare';
import { Controller } from '@neskjs/common/interfaces/controllers/controller.interface';
import { ExceptionsHandler } from '../exceptions/exceptions-handler';
import {
  EXCEPTION_FILTERS_METADATA,
  FILTER_CATCH_EXCEPTIONS,
} from '@neskjs/common/constants';
import {
  isEmpty,
  isFunction,
  isUndefined,
} from '@neskjs/common/utils/shared.utils';
import { Metatype } from '@neskjs/common/interfaces/index';
import { ExceptionFilterMetadata } from '@neskjs/common/interfaces/exceptions/exception-filter-metadata.interface';
import { UnknownModuleException } from '../errors/exceptions/unknown-module.exception';
import { ExceptionFilter } from '@neskjs/common/interfaces/exceptions/exception-filter.interface';
import { RouterProxyCallback } from './../router/router-proxy';
import { ApplicationConfig } from './../application-config';
import { BaseExceptionFilterContext } from '../exceptions/base-exception-filter-context';

export class RouterExceptionFilters extends BaseExceptionFilterContext {
  constructor(private readonly config: ApplicationConfig) {
    super();
  }

  public create(
    instance: Controller,
    callback: RouterProxyCallback,
  ): ExceptionsHandler {
    const exceptionHandler = new ExceptionsHandler();
    const filters = this.createContext(
      instance,
      callback,
      EXCEPTION_FILTERS_METADATA,
    );
    if (isEmpty(filters)) {
      return exceptionHandler;
    }
    exceptionHandler.setCustomFilters(filters);
    return exceptionHandler;
  }

  public getGlobalMetadata<T extends any[]>(): T {
    return this.config.getGlobalFilters() as T;
  }
}
