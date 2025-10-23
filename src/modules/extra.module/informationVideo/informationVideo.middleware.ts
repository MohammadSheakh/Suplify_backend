import { TFolderName } from "../../../enums/folderNames";
import { processUploadedFilesForUpdate } from "../../../middlewares/processUploadedFiles";
//@ts-ignore
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const imageUploadPipelineForUpdateInformationVideo = [
  [
    upload.fields([
      { name: 'thumbnail', maxCount: 1 }, // Allow up to 1 
      { name: 'video', maxCount: 1 }, // Allow up to 1 
    ]),
  ],
  processUploadedFilesForUpdate([
    {
      name: 'thumbnail',
      folder: TFolderName.trainingProgram,
      required: false, // optional
      allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'], // optional
    },
    {
      name: 'video',
      folder: TFolderName.trainingProgram,
      allowedMimeTypes: ['video/mp4', 'video/mov'],
    },
  ]),
];