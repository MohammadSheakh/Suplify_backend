//@ts-ignore
import { Request, Response, NextFunction } from 'express';
import sendResponse from '../shared/sendResponse';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
//@ts-ignore
import mongoose from 'mongoose';

/** ----------------------------------------------
 *
 * @desc this method helps us to update some field if provide in a model otherwise keep the original value 
 * 
*----------------------------------------------*/
export const patchWithDefaults = (
    /**
     * in which model you want to update ..so, pass model name .. if you provide wrong model name then it will show an ERROR : UnhandledRejection Detected Schema hasn't been registered for model "ServiceBooking".
     */
    modelName : string,
    /**
     * what are the fields that you want to update
     */
    updatableFields: string[] // e.g., ['name', 'email', 'status']
) => {
    return async (req: Request, res:Response, next:NextFunction) => {
        if (!req.user) {
            return sendResponse(res, {
                code: StatusCodes.UNAUTHORIZED,
                message: 'You are not authorized',
                success: false,
            });
        }

        const Model = mongoose.model(modelName);

        const document = await Model.findById(req.params.id);
        if (!document) {
            return sendResponse(res, {
                code: StatusCodes.NOT_FOUND,
                message: 'Document not found',
                success: false,
            });
        }

        // Build the payload: use req.body value if provided, otherwise fallback to original
        const payload: Record<string, any> = {};
        for (const field of updatableFields) {
            if (field in req.body) {
                payload[field] = req.body[field];
            } else {
                payload[field] = document[field as keyof typeof document];
            }
        }

        // Attach the merged payload to req.body (or a new property like req.validatedData)
        req.body = { ...req.body, ...payload };

        req.existingDocument = document; // so that in controller we dont need to fetch the document again
        next();
    }

}