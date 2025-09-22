//@ts-ignore
import mongoose from 'mongoose';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { SpecialistWorkoutClassSchedule } from './specialistWorkoutClassSchedule.model';
import { ISpecialistWorkoutClassSchedule } from './specialistWorkoutClassSchedule.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { toLocalTime, toUTCTime } from '../../../utils/timezone';
import { PaginateOptions } from '../../../types/paginate';
import PaginationService from '../../../common/service/paginationService';

export class SpecialistWorkoutClassScheduleService extends GenericService<
  typeof SpecialistWorkoutClassSchedule,
  ISpecialistWorkoutClassSchedule
> {
  constructor() {
    super(SpecialistWorkoutClassSchedule);
  }

  async createV2(data:ISpecialistWorkoutClassSchedule, userTimeZone: string) : Promise<ISpecialistWorkoutClassSchedule> {
    /********
     * 📝
     * Here first we have to check 
     * scheduleDate , startTime , endTime
     * -------------------------------
     * date time valid or not 
     * ****** */
    if(data.scheduleDate && data.startTime && data.endTime) {
        const scheduleDate = new Date(data.scheduleDate);
        
        data.startTime = toUTCTime(data.startTime, userTimeZone);
        data.endTime = toUTCTime(data.endTime, userTimeZone);

        if(isNaN(scheduleDate.getTime()) || isNaN(data.startTime.getTime()) || isNaN(data.endTime.getTime())) {
            throw new Error('Invalid date or time format');
        }

        if(data.startTime >= data.endTime) {
            throw new Error('Start time must be before end time');
        }
        const now = new Date();
        if(data.startTime < now) {
            throw new Error('Start time must be in the future');
        }

        // Check for overlapping schedules for the same specialist
        const overlappingSchedule = await SpecialistWorkoutClassSchedule.findOne({
            createdBy: data.createdBy,
            scheduleDate: scheduleDate,
            $or: [
                {
                    startTime: { $lt: data.endTime },
                    endTime: { $gt: data.startTime }
                }
            ]
        });

        if(overlappingSchedule) {
            throw new Error('Overlapping schedule exists for the doctor');
        }
    } else {
        throw new Error('scheduleDate, startTime and endTime are required');
    }
    
    const createdDoc = await this.model.create(data);

    // Convert back to user's timezone before returning
    const transformedDoc = {
        ...createdDoc.toObject(), // or .toJSON() if you prefer
        
        startTime: toLocalTime(createdDoc.startTime, userTimeZone),
        endTime:  toLocalTime(createdDoc.endTime, userTimeZone),
    };

    return transformedDoc;
  
  }


  /********
   * 
   * Patient | Get all workout class of a specialist .. 
   * if patient already buy a workout class also 
   * show that ... 
   * 
   * ******* */
  async getAllWithAggregation(
      filters: any, // Partial<INotification> // FixMe : fix type
      options: PaginateOptions,
      patientId: string,
    ) {
      
    //📈⚙️ Business logic: Build the aggregation pipeline
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


  
  /********
   * 
   * Specialist | Get all workout class with booking count 
   * 
   * ******* */
  async getAllWithAggregationForSpecialist(
      filters: any, // Partial<INotification> // FixMe : fix type
      options: PaginateOptions,
    ) {
      
      //📈⚙️ Business logic: Build the aggregation pipeline
      const pipeline = [
      // Match schedules created by this specialist
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(filters.createdBy),
          isDeleted: { $ne: true },
        },
      },

      // Lookup only scheduled bookings for this schedule
      {
        $lookup: {
          from: 'specialistpatientschedulebookings',
          let: { scheduleId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$workoutClassScheduleId', '$$scheduleId'] },
                    { $eq: ['$status', 'scheduled'] }, // ✅ only scheduled
                    { $ne: ['$isDeleted', true] },
                  ],
                },
              },
            },
          ],
          as: 'bookings',
        },
      },

      // Add booking count
      {
        $addFields: {
          bookingCount: { $size: '$bookings' },
        },
      },

      // Project fields you want to return
      {
        $project: {
          _id: 1,
          scheduleName: 1,
          scheduleDate: 1,
          startTime: 1,
          endTime: 1,
          description: 1,
          status: 1,
          price: 1,
          sessionType: 1,
          typeOfLink: 1,
          meetingLink: 1,
          bookingCount: 1, // 🆕 count of scheduled bookings
        },
      },

      // Sort by newest
      {
        $sort: { createdAt: -1 },
      },
    ];

    // Use pagination service for aggregation
    return await PaginationService.aggregationPaginate(
      SpecialistWorkoutClassSchedule, 
      pipeline,
      options
    );
  }




}
