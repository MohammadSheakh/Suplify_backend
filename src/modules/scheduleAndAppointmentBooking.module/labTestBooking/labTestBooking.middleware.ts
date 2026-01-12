import { TFolderName } from "../../../enums/folderNames";
import { processUploadedFilesForUpdate } from "../../../middlewares/processUploadedFiles";
//@ts-ignore
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//---------------------------
// 🥇 we move image upload thing to controller to middleware level
//---------------------------
export const imageUploadPipelineForUpdateLabTestBooking = [
  [
    upload.fields([
      { name: 'uploadedResults', maxCount: 1 }, // Allow up to 1 
    ]),
  ],
  processUploadedFilesForUpdate([
    {
      name: 'uploadedResults',
      folder: TFolderName.trainingProgram,
      required: false, // optional
      allowedMimeTypes: ['image/jpeg', 
        'image/png',
        'application/pdf',
        // Word documents
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      ], // optional
    },
  ]),
];

