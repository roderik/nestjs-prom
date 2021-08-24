"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromCatchAllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const graphql_1 = require("@nestjs/graphql");
const prom_service_1 = require("./prom.service");
const utils_1 = require("./utils");
function getBaseUrl(url) {
    if (!url) {
        return url;
    }
    if (url.indexOf('?') === -1) {
        return url;
    }
    return url.split('?')[0];
}
let PromCatchAllExceptionsFilter = class PromCatchAllExceptionsFilter extends core_1.BaseExceptionFilter {
    constructor(promService) {
        super();
        this._counter = promService.getCounter({
            name: 'http_exceptions',
            labelNames: ['method', 'status', 'path'],
        });
    }
    catch(exception, host) {
        var _a;
        const isGraphQLRequest = host.getType() === 'graphql';
        const request = isGraphQLRequest
            ? (_a = graphql_1.GqlExecutionContext.create(host).getContext()) === null || _a === void 0 ? void 0 : _a.req
            : host.switchToHttp().getRequest();
        const baseUrl = (request === null || request === void 0 ? void 0 : request.baseUrl) || (request === null || request === void 0 ? void 0 : request.originalUrl) || (request === null || request === void 0 ? void 0 : request.url) || '/';
        const method = isGraphQLRequest
            ? (request === null || request === void 0 ? void 0 : request.method) || 'POST'
            : request === null || request === void 0 ? void 0 : request.method;
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const path = utils_1.normalizePath(getBaseUrl(baseUrl), [], '#val');
        this._counter.inc({
            method,
            path,
            status,
        });
        if (!isGraphQLRequest) {
            super.catch(exception, host);
        }
    }
};
PromCatchAllExceptionsFilter = __decorate([
    common_1.Catch(),
    __metadata("design:paramtypes", [prom_service_1.PromService])
], PromCatchAllExceptionsFilter);
exports.PromCatchAllExceptionsFilter = PromCatchAllExceptionsFilter;
