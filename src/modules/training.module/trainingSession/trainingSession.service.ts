//@ts-ignore
import { StatusCodes } from 'http-status-codes';
//@ts-ignore
import mongoose from 'mongoose';
import { TrainingSession } from './trainingSession.model';
import { ITrainingSession } from './trainingSession.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { TrainingProgramPurchase } from '../trainingProgramPurchase/trainingProgramPurchase.model';
import { PatientTrainingSession } from '../patientTrainingSession/patientTrainingSession.model';
import { ITrainingProgramPurchase } from '../trainingProgramPurchase/trainingProgramPurchase.interface';
//@ts-ignore
import EventEmitter from 'events';
import { errorLogger } from '../../../shared/logger';
import PaginationService from '../../../common/service/paginationService';

const eventEmitForCreatePatientTrainingSessionForWhoPurchased = new EventEmitter(); 

interface ICreatePatientTrainingSessionForWhoPurchasedEventData {
  trainingProgramId: string;
  createdTrainingSession: ITrainingSession;
}

eventEmitForCreatePatientTrainingSessionForWhoPurchased.on(
  'eventEmitForCreatePatientTrainingSessionForWhoPurchased', async (data: ICreatePatientTrainingSessionForWhoPurchasedEventData) => {
  console.log("eventEmitForCreatePatientTrainingSessionForWhoPurchased event received for trainingProgramId ::", data )
  try {
    const patientWhoPurchasedThisProgram = await TrainingProgramPurchase.find({
      id: data.trainingProgramId
    })

    patientWhoPurchasedThisProgram.forEach( async (purchase : ITrainingProgramPurchase) => {
      // create patientTrainingSession for each purchase
      await PatientTrainingSession.create({
        patientId: purchase.patientId,
        trainingProgramId: data.trainingProgramId,
        trainingSessionId: data.createdTrainingSession._id,
        unlockDate: new Date( 
          purchase.createdAt.getTime() + 
          (data.createdTrainingSession.sessionCount - 1) * 7 * 24 * 60 * 60 * 1000
        ),
        isUnlocked: false, //  we will compute this in frontend // TODO : need to think about this 
      });
    });
  }catch (error) {
    errorLogger.error("Error occurred 🌋 while updating user profile's howManyPrograms count :: ", error);
    console.error("Error occurred 🌋 while updating user profile's howManyPrograms count :: ", error);
  }
});

export default eventEmitForCreatePatientTrainingSessionForWhoPurchased;


export class TrainingSessionService extends GenericService<
  typeof TrainingSession,
  ITrainingSession
> {
  constructor() {
    super(TrainingSession);
  }

  async create(data: ITrainingSession): Promise<ITrainingSession> {
    
    //---------------------------------
    // lets calculate this session count
    //---------------------------------
    let sessionCount = await TrainingSession.countDocuments({
      trainingProgramId: data.trainingProgramId,
    });

    data.sessionCount = ++ sessionCount;

    const createdTrainingSession =  await this.model.create(data); 

    /********
     * 📝
     * Lets say .. a patient purchase a training program..
     * after that .. specialist add new session to that program ..
     * then  for training program .. for every trainingProgramPurchase ...
     * 
     * we have to create patientTrainingSession 
     * ---------------
     * compute unlockDate dynamically
     * 
     *  unlockDate = new Date(purchaseDate.getTime() + (session.sessionCount - 1) * 7 * 24 * 60 * 60 * 1000);
        isUnlocked = today >= unlockDate;
     * 
     * ************** */

    //📈⚙️ OPTIMIZATION: do above work via event emitter for scalability
    eventEmitForCreatePatientTrainingSessionForWhoPurchased.emit(
      'eventEmitForCreatePatientTrainingSessionForWhoPurchased'
      , {trainingProgramId: data.trainingProgramId , createdTrainingSession} );

    return createdTrainingSession;
  }


  //---------------------------------
  // Patient | Get all training session of a training program ..
  //             along with session completion status from patientTrainingSession collection
  //---------------------------------
  async getTrainingSessionsForProgramWithPatientData(
    trainingProgramId: string,
    patientId: string, // Optional: if you want patient-specific status
    options: any = {} // Pagination options
  ) {
    
    // console.log("trainingProgramId :: ", trainingProgramId);
    // console.log("patientId :: ", patientId);
    // console.log("options :: ", options);

    // Build the aggregation pipeline
    const pipeline = [
      // Match all training sessions for the given program
      {
        $match: {
          trainingProgramId: new mongoose.Types.ObjectId(trainingProgramId),
          isDeleted: { $ne: true } // Assuming you have soft delete flag
        }
      },

      // Populate attachments (assuming it's an array of ObjectIds)
      {
        $lookup: {
          from: 'attachments', // Adjust to your actual file/media collection name
          localField: 'attachments',
          foreignField: '_id',
          as: 'attachments'
        }
      },

      // Trim attachments to only include 'attachment' field
      {
        $addFields: {
          attachments: {
            $map: {
              input: '$attachments',
              as: 'att',
              in: {
                attachment: '$$att.attachment'
              }
            }
          }
        }
      },

      // Populate coverPhotos (assuming it's an array; works for single too if wrapped)
      {
        $lookup: {
          from: 'attachments', // Same or different collection? Adjust if needed
          localField: 'coverPhotos',
          foreignField: '_id',
          as: 'coverPhotos'
        }
      },

      // Trim coverPhotos to only include 'attachment' field
      {
        $addFields: {
          coverPhotos: {
            $map: {
              input: '$coverPhotos',
              as: 'cp',
              in: {
                attachment: '$$cp.attachment'
              }
            }
          }
        }
      },

      // Left join with PatientTrainingSession collection for this patient
      {
        $lookup: {
          from: 'patienttrainingsessions', // Collection name (adjust if different)
          let: { sessionId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$trainingSessionId', '$$sessionId'] },
                    { $eq: ['$patientId', new mongoose.Types.ObjectId(patientId)] },
                    { $ne: ['$isDeleted', true] }
                  ]
                }
              }
            }
          ],
          as: 'patientSession'
        }
      },

      // Unwind patientSession to flatten (keep nulls if no match)
      {
        $unwind: {
          path: '$patientSession',
          preserveNullAndEmptyArrays: true
        }
      },

      // Project only needed fields
      {
        $project: {
          _id: 1,
          trainingSessionId: 1,
          trainingProgramId: 1,
          sessionCount: 1,
          title: 1,
          duration: 1,
          benefits: 1,
          tokenCount: 1,
          attachments: 1,
          coverPhotos: 1,
          trailerContent: 1,
          external_link: 1,
          durationUnit: 1,

          // Include patient-specific data if exists
          completeStatus: '$patientSession.status',
          isUnlockedForPatient: '$patientSession.isUnlocked',
          unlockDateForPatient: '$patientSession.unlockDate',

          // patientIsDeleted: '$patientSession.isDeleted',
          patientTrainingSessionId: '$patientSession.userTrainingSession_id'
        }
      },

      // Optional: Sort by sessionCount or title
      { $sort: { sessionCount: 1 } }
    ];

    // Use pagination service
    return await PaginationService.aggregationPaginate(
      TrainingSession, // Your Mongoose model for TrainingSession
      pipeline,
      options // { page, limit, etc. }
    );

  }

}
