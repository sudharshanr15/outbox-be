import { Response } from "express";
import { ApiResponse } from "../types";

export function sendResponse(res: Response, {statusCode = Number(200), success = true, message 
    = "", data, errors
}: ApiResponse){
    return res.status(statusCode).json({
        success,
        message,
        data,
        errors
    })
}