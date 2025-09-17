//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { DoctorPatient } from './doctorPatient.model';
import { IDoctorPatient } from './doctorPatient.interface';
import { GenericService } from '../../_generic-module/generic.services';
import PaginationService, { PaginateOptions } from '../../../common/service/paginationService';
//@ts-ignore
import mongoose from 'mongoose';
import { User } from '../../user/user.model';

export class DoctorPatientService extends GenericService<
  typeof DoctorPatient,
  IDoctorPatient
> {
  constructor() {
    super(DoctorPatient);
  }

  // 🟢🟢🟢 sheakh
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
}
