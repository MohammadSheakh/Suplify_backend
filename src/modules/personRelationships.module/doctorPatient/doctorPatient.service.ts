//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { DoctorPatient } from './doctorPatient.model';
import { IDoctorPatient } from './doctorPatient.interface';
import { GenericService } from '../../_generic-module/generic.services';
import PaginationService, { PaginateOptions } from '../../../common/service/paginationService';
//@ts-ignore
import mongoose from 'mongoose';
import { User } from '../../user/user.model';
import { Protocol } from '../../protocol.module/protocol/protocol.model';

export class DoctorPatientService extends GenericService<
  typeof DoctorPatient,
  IDoctorPatient
> {
  constructor() {
    super(DoctorPatient);
  }

  /**********
   * 
   * Patient | Get all Unknown Doctor .. 
   * 
   * ******** */
  async getUnknownDoctorsForPatient(patientId: string, 
    // options: PaginateOptions = {}
    filters : any,
    options :any
  ) {
    // Business logic: Build the aggregation pipeline
    const pipeline = [
      // Match all doctors
      {
        $match: {
          role: 'doctor',
          isDeleted: { $ne: true }
        }
      },
      // Left join with doctorpatient relationship
      {
        $lookup: {
          from: 'doctorpatients',
          let: { doctorId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$doctorId', '$$doctorId'] },
                    { $eq: ['$patientId', new mongoose.Types.ObjectId(patientId)] },
                    { $ne: ['$isDeleted', true] }
                  ]
                }
              }
            }
          ],
          as: 'relationship'
        }
      },
      // Filter out doctors with existing relationship
      {
        $match: {
          'relationship.0': { $exists: false }
        }
      },
      /********************************* */

      {
      $lookup: {
        from: 'userprofiles', // References 'UserProfile' collection
        localField: 'profileId',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              description: 1,
              approvalStatus: 1,
            }
          }
        ],
        as: 'profile'
      }
    },
    {
      $unwind: {
        path: '$profile',
        preserveNullAndEmptyArrays: true
      }
    },

      /********************************* */
      // Project only needed fields
      {
        $project: {
          _id: 1,
          name: 1,
          profileImage : 1,
          avatar: 1,
          profile: 1
        }
      }
    ];

    // Use pagination service for aggregation
    return await PaginationService.aggregationPaginate(User, pipeline,
      //  {
      //   page: options.page,
      //   limit: options.limit
      // }
      options
    );
  }

  /**********
   * 
   * Specialist | Members and protocol 
   *  |-> Get all doctor and protocol count for a patient 
   * 
   * ******** */
  async getAllDoctorAndProtocolCountForPatient(
    patientId: string,
    filters: any,
    options: any,
  ){
    // Business logic: Build the aggregation pipeline
    const pipeline = [
      {
        $match: {
          patientId: new mongoose.Types.ObjectId(patientId),
          isDeleted: { $ne: true }
        }
      },
      // Join with User collection to get doctor details
      {
        $lookup: {
          from: 'users',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      {
        $unwind: '$doctor'
      },
      // Join with Protocol collection to count protocols per doctor
      {
        $lookup: {
          from: 'protocols',
          let: { doctorId: '$doctorId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$createdBy', '$$doctorId'] },
                    { $eq: ['$isDeleted', false] }
                  ]
                }
              }
            },
            {
              $count: 'protocolCount'
            }
          ],
          as: 'protocols'
        }
      },
      {
        $addFields: {
          protocolCount: {
            $ifNull: [{ $arrayElemAt: ['$protocols.protocolCount', 0] }, 0]
          }
        }
      },
      // Project only necessary fields
      {
        $project: {
          _id: 1,
          doctorId: '$doctor._id',
          doctorName: '$doctor.name',
          doctorProfileImage: '$doctor.profileImage',
          protocolCount: 1
        }
      } 
    ];

    // Use pagination service for aggregation
    return await PaginationService.aggregationPaginate(DoctorPatient, pipeline,
      
      options
    );
  }

  /**********
   * 
   * Specialist | Members and protocol 
   *  |-> get all protocol for a doctor for patient 
   *  :patientId:
   *  :doctorId:
   * ******** */
  async getAllProtocolForADoctorForPatient(patientId: string, doctorId: string){
    // const protocols = await Protocol.find({
    //   createdBy: new mongoose.Types.ObjectId(doctorId),
    //   patientId: new mongoose.Types.ObjectId(patientId),
    //   isDeleted: { $ne: true }
    // }).select('-isDeleted -createdAt -updatedAt -__v -createdBy -patientId');

    // 📈⚙️ OPTIMIZATION:
    const protocols = await Protocol.aggregate([
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(doctorId),
          patientId: new mongoose.Types.ObjectId(patientId),
          isDeleted: { $ne: true }
        }
      },
      {
        $lookup: {
          from: "planbydoctors", // 👈 must match the actual collection name
          localField: "_id",
          foreignField: "protocolId",
          as: "plans"
        }
      },
      {
        $addFields: {
          totalPlanCount: {
            $size: {
              $filter: {
                input: "$plans",
                as: "plan",
                cond: { $eq: ["$$plan.isDeleted", false] }
              }
            }
          }
        }
      },
      {
        $project: {
          isDeleted: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          createdBy: 0,
          patientId: 0,
          plans: 0 // 👈 hide raw plans if you only want the count
        }
      }
    ]);

    return protocols;
  }
}
