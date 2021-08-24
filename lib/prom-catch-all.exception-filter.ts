import { Catch, ArgumentsHost, HttpException, HttpStatus, Inject } from "@nestjs/common";
import { BaseExceptionFilter } from '@nestjs/core';
import { CounterMetric, PromModuleOptions } from "./interfaces";
import { normalizePath } from './utils';
import { PromCounter } from './common';
import { DEFAULT_PROM_OPTIONS } from './prom.constants';
import { PromService } from './prom.service';

function getBaseUrl(url?: string) {
    if (!url) {
        return url;
    }

    if (url.indexOf('?') === -1) {
        return url;
    }
    return url.split('?')[0];
}

@Catch()
export class PromCatchAllExceptionsFilter extends BaseExceptionFilter {

    private readonly _counter: CounterMetric;

    constructor(
        promService: PromService,
    ) {
        super();

        this._counter = promService.getCounter({
            name: 'http_exceptions',
            labelNames: ['method', 'status', 'path'],
        });
    }

    catch(
        exception: unknown,
        host: ArgumentsHost,
    ) {
        const isGraphQLRequest = host.getType<GqlContextType>() === 'graphql'

        const request = isGraphQLRequest
            ? GqlExecutionContext.create(host as ExecutionContext).getContext()?.req
            : host.switchToHttp().getRequest()

        const baseUrl = request?.baseUrl || request?.originalUrl || request?.url || '/'
        const method = isGraphQLRequest
            ? request?.method || 'POST'
            : request?.method

        const status = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR

        const path = normalizePath(
            getBaseUrl(baseUrl),
            [],
            '#val',
        )
    
        this._counter.inc({
            method,
            path,
            status,
        })

        if ( ! isGraphQLRequest) {
            super.catch(exception, host)
        }
    }
}
