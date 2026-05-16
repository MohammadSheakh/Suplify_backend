//@ts-ignore
import mongoose from 'mongoose';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { SpecialistWorkoutClassSchedule } from './specialistWorkoutClassSchedule.model';
import { ISpecialistWorkoutClassSchedule } from './specialistWorkoutClassSchedule.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { buildLocalDateTime, combineDateAndTime, combineDateAndTimeV2, combineDateAndTimeV3, mergeDateAndTime, toLocalTime, toUTCTime, toUTCTimeV2 } from '../../../utils/timezone';
import { PaginateOptions } from '../../../types/paginate';
import PaginationService from '../../../common/service/paginationService';
import { TPaymentStatus } from '../specialistPatientScheduleBooking/specialistPatientScheduleBooking.constant';
import { TSpecialistWorkoutClassScheduleType } from './specialistWorkoutClassSchedule.constant';

export class SpecialistWorkoutClassScheduleService extends GenericService<
  typeof SpecialistWorkoutClassSchedule,
  ISpecialistWorkoutClassSchedule
> {
  constructor() {
    super(SpecialistWorkoutClassSchedule);
  }

  async createV2(data:ISpecialistWorkoutClassSchedule, userTimeZone: string) : Promise<ISpecialistWorkoutClassSchedule> {
    /******** 💎✨🔍 -> V3 Found
     * 📝
     * Here first we have to check 
     * scheduleDate , startTime , endTime
     * -------------------------------
     * date time valid or not 
     * ****** */
    if(data.scheduleDate && data.startTime && data.endTime) {
        const scheduleDate = new Date(data.scheduleDate);
        
        console.log("data.startTime before ->>>", data.startTime, typeof data.startTime)
        console.log("data.scheduleDate before ->>>", data.scheduleDate, typeof data.scheduleDate)

        data.startTime = toUTCTime(data.startTime, userTimeZone);
        data.endTime = toUTCTime(data.endTime, userTimeZone);

        console.log("scheduleDate.getTime() ->>>", scheduleDate.getTime())

        
        console.log("data.startTime.getTime() ->>>", data.startTime.getTime())

        console.log("data.endTime.getTime() ->>>", data.endTime.getTime())


        if(isNaN(scheduleDate.getTime()) ) {
            throw new Error('Invalid schedule date format');
        }

        if(isNaN(data.startTime.getTime()) ) {
            throw new Error('Invalid startTime format');
        }
        
        if(isNaN(data.endTime.getTime()) ) {
            throw new Error('Invalid endTime format');
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

    /*-───────────────────────────────── THIS CODE HAS SERIOUS LOGIC ISSUE
    |  Client want to create workout class oneTime and repeat mode like google calender.. 
    |  if "repeat" selected .. then client needs to provide
    |  weekDays [ "saturday" ], startDate, endDate 
    └──────────────────────────────────*/
  async createV3(data:ISpecialistWorkoutClassSchedule, userTimeZone: string) : Promise<ISpecialistWorkoutClassSchedule> {
    
    // console.log("data :: ", data);
    // ----------------------------
    // Common validation
    // ----------------------------
    if (!data.startTime || !data.endTime) {
        throw new Error('startTime and endTime are required');
    }

    data.startTime = toUTCTime(data.startTime, userTimeZone);
    data.endTime = toUTCTime(data.endTime, userTimeZone);

    if (isNaN(data.startTime.getTime())) throw new Error('Invalid startTime');

    if (isNaN(data.endTime.getTime())) throw new Error('Invalid endTime');

    if (data.startTime >= data.endTime) throw new Error('Start time must be before end time');

    if (data.startTime < new Date()) throw new Error('Start time must be in the future');

    //< 

    // ----------------------------
    // ONE_TIME
    // ----------------------------
    if (data.scheduleType === TSpecialistWorkoutClassScheduleType.oneTime) {
        
        if (!data.scheduleDate) throw new Error('scheduleDate is required');

        const scheduleDate = new Date(data.scheduleDate);

        if (isNaN(scheduleDate.getTime())) throw new Error('Invalid scheduleDate');

        // Overlap check
        const overlapping = await SpecialistWorkoutClassSchedule.findOne({
            createdBy: data.createdBy,
            scheduleType: TSpecialistWorkoutClassScheduleType.oneTime,
            scheduleDate,
            $or: [
                {
                    startTime: { $lt: data.endTime },
                    endTime: { $gt: data.startTime },
                },
            ],
        });

        if (overlapping) throw new Error('Overlapping schedule exists');

        const doc = await this.model.create(data);

        return {
        ...doc.toObject(),
        startTime: toLocalTime(doc.startTime, userTimeZone),
        endTime: toLocalTime(doc.endTime, userTimeZone),
        };
    }

    // ----------------------------
    // REPEAT
    // ----------------------------
    if (data.scheduleType ===  TSpecialistWorkoutClassScheduleType.repeat ) {
        
        const rule = data.repeatRule;

        if (!rule?.weekDays?.length || !rule?.startDate || !rule?.durationWeeks) {
            throw new Error('Invalid repeatRule');
        }

        const startDate = new Date(rule.startDate);
        if (isNaN(startDate.getTime())) throw new Error('Invalid repeat startDate');

        // Calculate endDate (important)
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + rule.durationWeeks * 7);

        data.repeatRule.startDate = startDate;
        data.repeatRule.endDate = endDate;

        /*---------------------- INCOMPLETE LOGIC ... NEED TO CHECK MORE USECASE
        // Overlap check (date range based)
        const overlapping = await SpecialistWorkoutClassSchedule.findOne({
            createdBy: data.createdBy,
            scheduleType: TSpecialistWorkoutClassScheduleType.repeat,
            status: 'available',
            $or: [
                {
                    'repeatRule.startDate': { $lte: endDate },
                    'repeatRule.endDate': { $gte: startDate },
                },
            ],
            startTime: { $lt: data.endTime },
            endTime: { $gt: data.startTime },
        });
        ----------------------*/

        const overlapping = await SpecialistWorkoutClassSchedule.findOne({
            createdBy: data.createdBy,
            scheduleType: TSpecialistWorkoutClassScheduleType.repeat,
            status: 'available',

            // Date overlap
            'repeatRule.startDate': { $lte: endDate },
            'repeatRule.endDate': { $gte: startDate },

            // Time overlap
            startTime: { $lt: data.endTime },
            endTime: { $gt: data.startTime },

            // Weekday overlap
            'repeatRule.weekDays': { $in: data.repeatRule.weekDays },
        });

        if (overlapping) throw new Error('Overlapping recurring schedule exists');

        const doc = await this.model.create(data);

        return {
            ...doc.toObject(),
            startTime: toLocalTime(doc.startTime, userTimeZone),
            endTime: toLocalTime(doc.endTime, userTimeZone),
        };
    }

    throw new Error('Invalid scheduleType');  
  }

  async createV4(data: ISpecialistWorkoutClassSchedule, userTimeZone: string): Promise<ISpecialistWorkoutClassSchedule> {
    
    console.log("-- UserTimeZone ::", userTimeZone);

    // ----------------------------
    // Common validation
    // ----------------------------
    if (!data.startTime || !data.endTime) {
        throw new Error('startTime and endTime are required');
    }

    // ----------------------------
    // ONE_TIME
    // ----------------------------
    if (data.scheduleType === TSpecialistWorkoutClassScheduleType.oneTime) {
        
        if (!data.scheduleDate) throw new Error('scheduleDate is required');

        const scheduleDate = new Date(data.scheduleDate);
        if (isNaN(scheduleDate.getTime())) throw new Error('Invalid scheduleDate');

        // Combine scheduleDate with time strings to create full datetime
        // combineDateAndTime
        const startDateTime = combineDateAndTimeV3(scheduleDate, data.startTime as string, userTimeZone);
        const endDateTime = combineDateAndTimeV3(scheduleDate, data.endTime as string, userTimeZone);

        // Convert to UTC
        // data.startTime = toUTCTime(startDateTime, userTimeZone);
        // data.endTime = toUTCTime(endDateTime, userTimeZone);

        data.startTime = toUTCTimeV2(startDateTime, userTimeZone);
        data.endTime = toUTCTimeV2(endDateTime, userTimeZone);

        if (isNaN(data.startTime.getTime())) throw new Error('Invalid startTime');
        if (isNaN(data.endTime.getTime())) throw new Error('Invalid endTime');
        if (data.startTime >= data.endTime) throw new Error('Start time must be before end time');
        if (data.startTime < new Date()) throw new Error('Start time must be in the future');

        // Store scheduleDate as date-only (no time component)
        data.scheduleDate = new Date(scheduleDate.toISOString().split('T')[0] + 'T00:00:00.000Z');

        // Overlap check
        const overlapping = await SpecialistWorkoutClassSchedule.findOne({
            createdBy: data.createdBy,
            scheduleType: TSpecialistWorkoutClassScheduleType.oneTime,
            scheduleDate: data.scheduleDate,
            startTime: { $lt: data.endTime },
            endTime: { $gt: data.startTime },
        });

        if (overlapping) throw new Error('Overlapping schedule exists');

        const doc = await this.model.create(data);

        return {
            ...doc.toObject(),
            startTime: toLocalTime(doc.startTime, userTimeZone),
            endTime: toLocalTime(doc.endTime, userTimeZone),
        };
    }

    // ----------------------------
    // REPEAT
    // ----------------------------
    if (data.scheduleType === TSpecialistWorkoutClassScheduleType.repeat) {
        
        const rule = data.repeatRule;

        if (!rule?.weekDays?.length || !rule?.startDate || !rule?.durationWeeks) {
            throw new Error('Invalid repeatRule');
        }

        const startDate = new Date(rule.startDate);
        if (isNaN(startDate.getTime())) throw new Error('Invalid repeat startDate');

        // Combine startDate with time strings to create full datetime
        // combineDateAndTime
        const startDateTime = combineDateAndTimeV3(startDate, data.startTime as string, userTimeZone);
        const endDateTime = combineDateAndTimeV3(startDate, data.endTime as string, userTimeZone);

        // Convert to UTC
        // data.startTime = toUTCTime(startDateTime, userTimeZone);
        // data.endTime = toUTCTime(endDateTime, userTimeZone);

        data.startTime = toUTCTimeV2(startDateTime, userTimeZone);
        data.endTime = toUTCTimeV2(endDateTime, userTimeZone);

        if (isNaN(data.startTime.getTime())) throw new Error('Invalid startTime');
        if (isNaN(data.endTime.getTime())) throw new Error('Invalid endTime');
        if (data.startTime >= data.endTime) throw new Error('Start time must be before end time');

        // Calculate endDate
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + rule.durationWeeks * 7);

        data.repeatRule.startDate = startDate;
        data.repeatRule.endDate = endDate;

        // Overlap check
        const overlapping = await SpecialistWorkoutClassSchedule.findOne({
            createdBy: data.createdBy,
            scheduleType: TSpecialistWorkoutClassScheduleType.repeat,
            status: 'available',
            'repeatRule.startDate': { $lte: endDate },
            'repeatRule.endDate': { $gte: startDate },
            startTime: { $lt: data.endTime },
            endTime: { $gt: data.startTime },
            'repeatRule.weekDays': { $in: data.repeatRule.weekDays },
        });

        if (overlapping) throw new Error('Overlapping recurring schedule exists');

        const doc = await this.model.create(data);

        return {
            ...doc.toObject(),
            startTime: toLocalTime(doc.startTime, userTimeZone),
            endTime: toLocalTime(doc.endTime, userTimeZone),
        };
    }

    throw new Error('Invalid scheduleType');  
}





  /********
   * 
   * Patient | Get all workout class of a specialist .. 
   * if patient already buy a workout class also 
   * show that ... 
   *
   * GUIDE FOR FRONTEND : 🎨
   * if "latestBookingStatus" not null .. then show that
   * if "latestBookingStatus" null then print "status"
   *
   * ******* */
  async getAllWithAggregation(
      filters: any, // Partial<INotification> // FixMe : fix type
      options: PaginateOptions,
      patientId: string,
    ) {
     const pipelineV3 = [
    // 1. Match schedules for the specialist
    {
        $match: {
            createdBy: new mongoose.Types.ObjectId(filters.createdBy), // specialist ID
            isDeleted: { $ne: true } // exclude deleted schedules
        }
    },

    // 2. Lookup recent bookings by this patient (max 4, sorted by latest first)
    {
        $lookup: {
            from: "specialistpatientschedulebookings", // your booking collection name
            let: { scheduleId: "$_id" },
            pipeline: [
                {
                    $match: {
                        $expr: { $eq: ["$workoutClassScheduleId", "$$scheduleId"] },
                        patientId: new mongoose.Types.ObjectId(patientId),
                        isDeleted: { $ne: true },
                        // paymentStatus : TPaymentStatus.paid,
                        paymentStatus: { $in: [TPaymentStatus.paid, TPaymentStatus.unpaid] } // try to fix bug
                    }
                },
                {
                    $sort: { createdAt: -1 } // Latest bookings first
                },
                {
                    $limit: 4 // Only get the latest 4 bookings for this schedule
                },
                {
                    $project: {
                        _id: 1,
                        status: 1,
                        paymentStatus: 1,
                        paymentMethod: 1,
                        price: 1,
                        scheduleDate: 1,
                        startTime: 1,
                        endTime: 1,
                        createdAt: 1,
                        updatedAt: 1
                    }
                }
            ],
            as: "patientBookings"
        }
    },

    // 3. Add computed fields to determine if patient has active booking
    {
        $addFields: {
            // Check if patient has any valid booking for this schedule
            hasPatientBooking: {
                $gt: [{ $size: "$patientBookings" }, 0]
            },
            
            // ✅ Add total booking count 🚩
            totalPatientBookings: { $size: "$patientBookings" },

            // Get the latest booking status
            latestBookingStatus: {
                $cond: {
                    if: { $gt: [{ $size: "$patientBookings" }, 0] },
                    then: { $arrayElemAt: ["$patientBookings.status", 0] },
                    else: null
                }
            },

            // Get the latest payment status
            latestPaymentStatus: {
                $cond: {
                    if: { $gt: [{ $size: "$patientBookings" }, 0] },
                    then: { $arrayElemAt: ["$patientBookings.paymentStatus", 0] },
                    else: null
                }
            }
        }
    },

    ////////////////////////////////// 🆕 block start

    // Lookup hotspot details
    {
        $lookup: {
            from: 'suplifyhotspots',
            localField: 'hotspotId',
            foreignField: '_id',
            as: 'hotspot',
        },
    },

    // Convert hotspot array → object //🆕
    {
        $unwind: {
            path: '$hotspot',
            preserveNullAndEmptyArrays: true, // important
        },
    },
    //🆕
    {
        $lookup: {
            from: 'attachments',
            localField: 'hotspot.attachments',
            foreignField: '_id',
            as: 'hotspotAttachments',
        },
    },
    // Convert hotspotAttachments array → object //🆕
    {
        $unwind: {
            path: '$hotspotAttachments',
            preserveNullAndEmptyArrays: true, // important
        },
    },
    { //🆕
        $addFields: {
            'hotspot.attachments': '$hotspotAttachments',
        },
    },

    /////////////////////////////////// 🆕 block end 

    // 4. Project final shape with conditional fields
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
            createdBy: 1,
            createdAt: 1,
            updatedAt: 1,
            //---------------
            scheduleType: 1, // 🆕
            hotspotId : 1, // 🆕
            classType : 1, // 🆕
            repeatRule : 1, // 🆕

            // 🆕 Hotspot details
            hotspot: {
                _id: '$hotspot._id',
                name: '$hotspot.name',
                address: '$hotspot.address',

                // 🖼️ attachments populated
                attachments: {
                    _id: '$hotspot.attachments._id',
                    attachment: '$hotspot.attachments.attachment',
                    attachmentType : '$hotspot.attachments.attachmentType',
                },
            },
            
            // Conditional fields - only show if patient has valid booking
            typeOfLink: {
                $cond: {
                    if: {
                        $and: [
                            { $gt: [{ $size: "$patientBookings" }, 0] },
                            {
                                $in: [
                                    "$latestBookingStatus",
                                    ["scheduled", "completed"] // only for valid bookings
                                ]
                            }
                        ]
                    },
                    then: "$typeOfLink",
                    else: null
                }
            },
            
            meetingLink: {
                $cond: {
                    if: {
                        $and: [
                            { $gt: [{ $size: "$patientBookings" }, 0] },
                            {
                                $in: [
                                    "$latestBookingStatus",
                                    ["scheduled", "completed"]
                                ]
                            }
                        ]
                    },
                    then: "$meetingLink",
                    else: null
                }
            },

            // Patient booking information
            hasPatientBooking: 1,
            totalPatientBookings: 1, // ✅ show booking count 🚩
            latestBookingStatus: 1,
            latestPaymentStatus: 1,
            patientBookings: 1, // Full array of latest 4 bookings

            // Additional helpful flags
            isBookedByPatient: {
                $cond: {
                    if: {
                        $and: [
                            { $gt: [{ $size: "$patientBookings" }, 0] },
                            {
                                $in: [
                                    "$latestBookingStatus",
                                    ["pending", "scheduled", "completed"]
                                ]
                            }
                        ]
                    },
                    then: true,
                    else: false
                }
            },

            isPaidByPatient: {
                $cond: {
                    if: {
                        $and: [
                            { $gt: [{ $size: "$patientBookings" }, 0] },
                            { $eq: ["$latestPaymentStatus", "paid"] }
                        ]
                    },
                    then: true,
                    else: false
                }
            }
        }
    },

    // 5. Sort schedules (upcoming first, then by start time)
    {
        $sort: { 
            scheduleDate: 1, 
            startTime: 1 
        }
    }
]; 
    

    // Use pagination service for aggregation
    return await PaginationService.aggregationPaginate(
      SpecialistWorkoutClassSchedule, 
      pipelineV3,
      options
    );
  }

  /******** 💎✨🔍 -> V2 Found
   * 
   * Specialist | Get all workout class with booking count 
   * 
   * from SpecialistPatientScheduleBookingSchema
   * reponse also contains count of scheduled bookings for each booking..
   * not for [status.pending] [status.cancelled] [status.completed]
   * only for [status.scheduled]
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

  /********🆕🆕
   * 
   * Specialist | Get all workout class with booking count 
   * 
   * from SpecialistPatientScheduleBookingSchema
   * reponse also contains count of scheduled bookings for each booking..
   * not for [status.pending] [status.cancelled] [status.completed]
   * only for [status.scheduled]
   * 
   * ------------------------
   * 
   * As per New Requirement ..  lets provide all the property that available .. 
   * 
   * ******* */
  async getAllWithAggregationForSpecialistV2(
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



      // Lookup hotspot details
    {
        $lookup: {
            from: 'suplifyhotspots',
            localField: 'hotspotId',
            foreignField: '_id',
            as: 'hotspot',
        },
    },

    // Convert hotspot array → object //🆕
    {
        $unwind: {
            path: '$hotspot',
            preserveNullAndEmptyArrays: true, // important
        },
    },
    //🆕
    {
        $lookup: {
            from: 'attachments',
            localField: 'hotspot.attachments',
            foreignField: '_id',
            as: 'hotspotAttachments',
        },
    },
    // Convert hotspotAttachments array → object //🆕
    {
        $unwind: {
            path: '$hotspotAttachments',
            preserveNullAndEmptyArrays: true, // important
        },
    },
    { //🆕
        $addFields: {
            'hotspot.attachments': '$hotspotAttachments',
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

        //---------------
        repeatRule : 1,
        scheduleType : 1,
        hotspotId : 1,
        classType : 1,
        
        // 🆕 Hotspot details
        hotspot: {
            _id: '$hotspot._id',
            name: '$hotspot.name',
            address: '$hotspot.address',

            // 🖼️ attachments populated
            attachments: {
                _id: '$hotspot.attachments._id',
                attachment: '$hotspot.attachments.attachment',
                attachmentType : '$hotspot.attachments.attachmentType',
            },
        },

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
