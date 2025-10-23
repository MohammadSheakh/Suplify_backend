import { TFolderName } from "../../../enums/folderNames";
import { processUploadedFilesForUpdate } from "../../../middlewares/processUploadedFiles";
//@ts-ignore
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const imageUploadPipelineForUpdateProduct = [
  [
    upload.fields([
      { name: 'attachments', maxCount: 1 }, // Allow up to 1 
    ]),
  ],
  processUploadedFilesForUpdate([
    {
      name: 'attachments',
      folder: TFolderName.trainingProgram,
      required: false, // optional
      allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'], // optional
    },
  ]),
];
