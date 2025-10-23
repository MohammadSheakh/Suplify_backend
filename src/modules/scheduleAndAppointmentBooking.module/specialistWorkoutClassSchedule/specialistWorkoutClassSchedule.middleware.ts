import { TFolderName } from "../../../enums/folderNames";
import { processUploadedFilesForUpdate } from "../../../middlewares/processUploadedFiles";
//@ts-ignore
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//---------- no image upload needed for workout class
// export const imageUploadPipelineForUpdateWorkoutClass = [
//   [
//     upload.fields([
//       { name: 'attachments', maxCount: 1 }, // Allow up to 1 cover photo
//       { name: 'trailerContents', maxCount: 1 }, // Allow up to 1 trailer video
//     ]),
//   ],
//   processUploadedFilesForUpdate([
//     {
//       name: 'attachments',
//       folder: TFolderName.trainingProgram,
//       required: false, // optional
//       allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'], // optional
//     },
//     {
//       name: 'trailerContents',
//       folder: TFolderName.trainingProgram,
//       allowedMimeTypes: ['video/mp4', 'video/mov'],
//     },
//   ]),
// ];