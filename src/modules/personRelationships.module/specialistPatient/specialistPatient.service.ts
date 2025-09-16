//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { SpecialistPatient } from './specialistPatient.model';
import { ISpecialistPatient } from './specialistPatient.interface';
import { GenericService } from '../../_generic-module/generic.services';
//@ts-ignore
import mongoose from 'mongoose';
import PaginationService from '../../../common/service/paginationService';
import { User } from '../../user/user.model';

export class SpecialistPatientService extends GenericService<
  typeof SpecialistPatient,
  ISpecialistPatient
> {
  constructor() {
    super(SpecialistPatient);
  }

  // 🟢🟢🟢 sheakh
  async getUnknownSpecialistsForPatient(patientId: string, 
    // options: PaginateOptions = {}
    filters : any,
    options :any
  ) {
    // Business logic: Build the aggregation pipeline
    const pipeline = [
      // Match all specialists
      {
        $match: {
          role: 'specialist',
          isDeleted: { $ne: true }
        }
      },
      // Left join with specialistpatient relationship
      {
        $lookup: {
          from: 'specialistpatients',
          let: { specialistId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$specialistId', '$$specialistId'] },
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
              howManyPrograms: 1, 
              protocolNames : 1
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
   * Doctor | Protocol Section | Show all Specialist for assign to a patient
   * 
   * ********** */
  async getUnknownSpecialistsForPatientForAssign(patientId: string, 
    // options: PaginateOptions = {}
    filters : any,
    options :any
  ) {
    // Business logic: Build the aggregation pipeline
    const pipeline = [
      // Match all specialists
      {
        $match: {
          role: 'specialist',
          isDeleted: { $ne: true }
        }
      },
      // Left join with specialistpatient relationship
      {
        $lookup: {
          from: 'specialistpatients',
          let: { specialistId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$specialistId', '$$specialistId'] },
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
              howManyPrograms: 1, 
              protocolNames : 1
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

    // Filter for only approved specialists
    {
      $match: {
        'profile.approvalStatus': 'approved'
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


    const [result] = await User.aggregate(pipeline).exec();

    return result;

    /************
    // Use pagination service for aggregation
    return await PaginationService.aggregationPaginate(User, pipeline,
      //  {
      //   page: options.page,
      //   limit: options.limit
      // }
      options
    );
    ********* */
  }
}
