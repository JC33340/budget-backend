"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const inputValidation = (req, res, next) => {
    try {
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ message: result.array() });
        }
        next();
    }
    catch (e) {
        next(e);
    }
};
exports.default = inputValidation;
