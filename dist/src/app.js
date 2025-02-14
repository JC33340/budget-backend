"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_config_1 = __importDefault(require("./config/express.config"));
const error_middleware_1 = require("./middleware/error.middleware");
const index_1 = __importDefault(require("./routes/index"));
express_config_1.default.get('/health', (_req, res) => {
    return res.status(200).send('ok');
});
//routes
express_config_1.default.use('/api', index_1.default);
//errors placed at the bottom of the stack, to ensure that it is a global catch
express_config_1.default.use(error_middleware_1.convertError);
express_config_1.default.use(error_middleware_1.endpointNotFound);
express_config_1.default.use(error_middleware_1.handleError);
exports.default = express_config_1.default;
