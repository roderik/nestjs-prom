"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromSummary = void 0;
const common_1 = require("@nestjs/common");
const prom_utils_1 = require("./prom.utils");
exports.PromSummary = common_1.createParamDecorator((data) => {
    const arg = {};
    if (typeof data === 'string') {
        arg.name = data;
    }
    if (typeof data === 'object') {
        arg.name = data.name;
        arg.help = data.help;
        arg.labelNames = data.labelNames;
    }
    if (!arg.name || arg.name.length === 0) {
        throw new Error(`PromSummary need an argument, must be a fulfilled string or IPromSummaryDecoratorArg instance`);
    }
    return prom_utils_1.findOrCreateSummary(arg);
});
