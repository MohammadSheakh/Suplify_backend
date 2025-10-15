import { TFolderName } from "../../../enums/folderNames";
import { processUploadedFilesForUpdate } from "../../../middlewares/processUploadedFiles";
//@ts-ignore
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//---------------------------
// 🥇 we move image upload thing to controller to middleware level
//---------------------------
export const imageUploadPipelineForUpdateTrainingProgram = [
  [
    upload.fields([
      { name: 'attachments', maxCount: 1 }, // Allow up to 1 cover photo
      { name: 'trailerContents', maxCount: 1 }, // Allow up to 1 trailer video
    ]),
  ],
  processUploadedFilesForUpdate([
    {
      name: 'attachments',
      folder: TFolderName.trainingProgram,
      required: false, // optional
      allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'], // optional
    },
    {
      name: 'trailerContents',
      folder: TFolderName.trainingProgram,
      allowedMimeTypes: ['video/mp4', 'video/mov'],
    },
  ]),
];