import { TFolderName } from "../../../enums/folderNames";
import { processUploadedFiles } from "../../../middlewares/processUploadedFiles";
//@ts-ignore
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//---------------------------
// 🥇 we move image upload thing to controller to middleware level
//---------------------------
export const imageUploadPipelineForTrainingProgram = [
  [
    upload.fields([
      { name: 'attachments', maxCount: 1 }, // Allow up to 1 cover photo
      { name: 'trailerContents', maxCount: 1 }, // Allow up to 1 trailer video
    ]),
  ],
  processUploadedFiles([
    {
      name: 'attachments',
      folder: TFolderName.trainingProgram,
      required: true, // optional
      allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'], // optional
    },
    {
      name: 'trailerContents',
      folder: TFolderName.trainingProgram,
      allowedMimeTypes: ['video/mp4', 'video/mov'],
    },
  ]),
];