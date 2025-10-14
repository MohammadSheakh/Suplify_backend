//@ts-ignore
import { Request, Response, NextFunction } from 'express';
import { processFilesV2 } from '../helpers/processFilesToUpload';
import { FileFieldConfig } from '../modules/attachments/attachment.interface';

type UploadedFiles = Record<string, string[]>;

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      uploadedFiles?: UploadedFiles;
    }
  }
}

/**
 * Process uploaded files from Express request
 * 
 * This middleware processes the uploaded files from Express request,
 * validates the file types, and stores the uploaded file URLs
 * in the request object.
 * 
 * @param {FileFieldConfig[]} configs - An array of file field configurations
 * @returns {(req: Request, res: Response, next: NextFunction) => Promise<void>} - The middleware function
 */
//-------------------------------------
// middleware 
//-------------------------------------
export const processUploadedFiles = (configs: FileFieldConfig[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const uploadedFiles: UploadedFiles = {};

      for (const config of configs) {
        const files = req.files?.[config.name] as Express.Multer.File[] | undefined;

        // ✅ 1. Required field check
        if (config.required && (!files || files.length === 0)) {
          throw new Error(`Missing required file field: ${config.name}`);
        }

        // ✅ 2. MIME type validation
        if (config.allowedMimeTypes && files?.length) {
          const invalid = files.some(
            (f) => !config.allowedMimeTypes!.includes(f.mimetype)
          );
          if (invalid) {
            throw new Error(`Invalid file type for field: ${config.name}`);
          }
        }

        // ✅ 3. Process (upload) files
        uploadedFiles[config.name] = await processFilesV2(files, config.folder);
      }

      req.uploadedFiles = uploadedFiles;
      next();
    } catch (error) {
      next(error);
    }
  };
};


