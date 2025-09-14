//@ts-ignore
import { StatusCodes } from 'http-status-codes';
//@ts-ignore
import mongoose from 'mongoose';
import { ITrainingProgram } from './trainingProgram.interface';
import { TrainingProgram } from './trainingProgram.model';
import { GenericService } from '../../_generic-module/generic.services';
import { PaginateOptions } from '../../../types/paginate';
import PaginationService from '../../../common/service/paginationService';
//@ts-ignore
import EventEmitter from 'events';
import { UserProfile } from '../../user/userProfile/userProfile.model';
import { errorLogger } from '../../../shared/logger';

const eventEmitForUpdateSpecialistUserProfile = new EventEmitter(); 

eventEmitForUpdateSpecialistUserProfile.on('eventEmitForUpdateSpecialistUserProfile', async (specialistId: any) => {
  console.log("eventEmitForUpdateSpecialistUserProfile event received for specialistId ::",specialistId )
  try {
    const trainingProgramCount = await TrainingProgram.countDocuments({ createdBy: specialistId, isDeleted: { $ne: true } });

    const res = await UserProfile.findOneAndUpdate({
      userId: specialistId
    }, {
      howManyPrograms: trainingProgramCount 
    }, { new: true });

  }catch (error) {
    errorLogger.error("Error occurred 🌋 while updating user profile's howManyPrograms count :: ", error);
    console.error("Error occurred 🌋 while updating user profile's howManyPrograms count :: ", error);
  }
});

export default eventEmitForUpdateSpecialistUserProfile;

export class TrainingProgramService extends GenericService<
  typeof TrainingProgram,
  ITrainingProgram
> {
  constructor() {
    super(TrainingProgram);
  }

  /********
   * 
   * Patient | Get all training program of a specialist .. 
   * if patient already buy a training program also 
   * show that ... 
   * 
   * ******* */
  async getAllWithAggregation(
      filters: any, // Partial<INotification> // FixMe : fix type
      options: PaginateOptions,
      patientId: string,
    ) {
      // Business logic: Build the aggregation pipeline
    const pipeline = [
    // Match training programs created by the specialist
    {
      $match: {
        createdBy: new mongoose.Types.ObjectId(filters.createdBy),
        isDeleted: { $ne: true }
      }
    },
    
    // Left join with trainingprogrampurchases to check if patient has purchased
    {
      $lookup: {
        from: 'trainingprogrampurchases', // TrainingProgramPurchase collection
        let: { trainingProgramId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$trainingProgramId', '$$trainingProgramId'] },
                  { $eq: ['$patientId', new mongoose.Types.ObjectId(patientId)] },
                  { $ne: ['$isDeleted', true] }
                ]
              }
            }
          }
        ],
        as: 'purchases'
      }
    },
    
    // Left join with attachments for main content
    {
      $lookup: {
        from: 'attachments',
        localField: 'attachments',
        foreignField: '_id',
        as: 'attachmentDetails'
      }
    },
    
    // Left join with trailer content attachments
    {
      $lookup: {
        from: 'attachments',
        localField: 'trailerContents',
        foreignField: '_id',
        as: 'trailerContentDetails'
      }
    },
    
    // Left join with specialist (creator) details
    // {
    //   $lookup: {
    //     from: 'users',
    //     localField: 'createdBy',
    //     foreignField: '_id',
    //     as: 'specialistDetails'
    //   }
    // },
    
    // Add computed fields
    {
      $addFields: {
        isPurchased: {
          $cond: {
            if: { $gt: [{ $size: '$purchases' }, 0] },
            then: true,
            else: false
          }
        },
        purchaseDetails: {
          $cond: {
            if: { $gt: [{ $size: '$purchases' }, 0] },
            then: { $arrayElemAt: ['$purchases', 0] },
            else: null
          }
        },
        // specialist: {
        //   $arrayElemAt: ['$specialistDetails', 0]
        // }
      }
    },
    
    // Project final output
    {
      $project: {
        _id: 1,
        programName: 1,
        // description: 1,
        durationInMonths: 1,
        totalSessionCount: 1,
        price: 1,
        // createdBy: 1, // may be we dont need this 
        isPurchased: 1,
        // Include purchase details if purchased
        'purchaseDetails._id': 1,
        'purchaseDetails.price': 1,
        'purchaseDetails.paymentStatus': 1,
        'purchaseDetails.paymentMethod': 1,
        'purchaseDetails.createdAt': 1,
        /////////// Specialist details
        // 'specialist._id': 1,
        // 'specialist.name': 1,
        // 'specialist.profileImage': 1,
        // 'specialist.avatar': 1,
        /***********
         * 
         * $ references fields from the current document
          $$ references variables defined in the aggregation expression 
          (like the as variable in $map)
         * 
         * **** */
        // Attachment details
        attachmentDetails: {
          $map: {
            input: '$attachmentDetails',
            as: 'attachment',
            in: {
              _id: '$$attachment._id',
              attachment: '$$attachment.attachment',
              attachmentType: '$$attachment.attachmentType'
            }
          }
        },
        // Trailer content details
        trailerContentDetails: {
          $map: {
            input: '$trailerContentDetails',
            as: 'trailer',
            in: {
              _id: '$$trailer._id',
              attachment: '$$trailer.attachment',
              attachmentType: '$$trailer.attachmentType'
            }
          }
        },
      }
    },
    
    // Sort by creation date (newest first)
    {
      $sort: {
        createdAt: -1
      }
    }
  ];

    // Use pagination service for aggregation
    return await PaginationService.aggregationPaginate(
      TrainingProgram, 
      pipeline,
      options
    );
  }
}

//  {
//   page: options.page,
//   limit: options.limit
// }
/////////// options
