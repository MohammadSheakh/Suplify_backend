//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { DoctorSpecialistPatient } from './doctorSpecialistPatient.model';
import { IDoctorSpecialistPatient } from './doctorSpecialistPatient.interface';
import { GenericService } from '../../_generic-module/generic.services';
//@ts-ignore
import mongoose from 'mongoose';

export class DoctorSpecialistPatientService extends GenericService<
  typeof DoctorSpecialistPatient,
  IDoctorSpecialistPatient
> {
  constructor() {
    super(DoctorSpecialistPatient);
  }

  //📈⚙️ OPTIMIZATION:
  async getAllWithSpecilistWhoGiveSuggestionToDoctorsPlan(patientId: string) {

    
    const pipelineV1 = [
      // Match doctor-specialist-patient relationships for the specific patient
      {
        $match: {
          patientId: new mongoose.Types.ObjectId(patientId),
          isDeleted: { $ne: true }
        }
      },
      
      // Lookup specialist details
      {
        $lookup: {
          from: 'users',
          localField: 'specialistId',
          foreignField: '_id',
          pipeline: [
            {
              $match: {
                role: 'specialist',
                isDeleted: { $ne: true }
              }
            },
            // {
            //   $lookup: {
            //     from: 'userprofiles',
            //     localField: 'profileId',
            //     foreignField: '_id',
            //     pipeline: [
            //       {
            //         $project: {
            //           description: 1,
            //           approvalStatus: 1,
            //           specialization: 1, // Added specialization field
            //           experience: 1 // Added experience field
            //         }
            //       }
            //     ],
            //     as: 'profile'
            //   }
            // },
            // {
            //   $unwind: {
            //     path: '$profile',
            //     preserveNullAndEmptyArrays: true
            //   }
            // }
          ],
          as: 'specialist'
        }
      },
      
      // Lookup doctor details
      {
        $lookup: {
          from: 'users',
          localField: 'doctorId',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                name: 1,
                profileImage: 1
              }
            }
          ],
          as: 'doctor'
        }
      },
      
      // Lookup plan statistics for this doctor-patient combination
      {
        $lookup: {
          from: 'planbydoctors',
          let: { 
            doctorId: '$doctorId',
            patientId: '$patientId'
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$createdBy', '$$doctorId'] },
                    { $eq: ['$patientId', '$$patientId'] },
                    { $ne: ['$isDeleted', true] }
                  ]
                }
              }
            },
            {
              $group: {
                _id: '$planType',
                count: { $sum: 1 }
              }
            }
          ],
          as: 'planStats'
        }
      },
      
      // Unwind arrays and restructure data
      {
        $unwind: {
          path: '$specialist',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $unwind: {
          path: '$doctor',
          preserveNullAndEmptyArrays: true
        }
      },
      
      // Final projection
      {
        $project: {
          _id: 1,
          patientId: 1,
          specialist: {
            _id: '$specialist._id',
            name: '$specialist.name',
            profileImage: '$specialist.profileImage',
            avatar: '$specialist.avatar',
            profile: '$specialist.profile'
          },
          doctor: {
            _id: '$doctor._id',
            name: '$doctor.name',
            profileImage: '$doctor.profileImage'
          },
          planStats: 1,
          totalPlans: { $size: '$planStats' },
          createdAt: 1,
          updatedAt: 1
        }
      }
    ];


    /********
     * 
     * Patient | Specialist Suggestion
     * | -> For A Patient ..
     *  get all doctorSpefcialistPatient
     *   .. from those documents for every doctorId 
     *   get total plan count by createdBy(doctorId) from planByDoctor collection .. 
     * 
     * ********** */
    const pipeline = [
      // 1. Start from relation table
      {
        $match: {
          patientId: new mongoose.Types.ObjectId(patientId),
          isDeleted: { $ne: true }
        }
      },

      // 2. Lookup doctor details
      {
        $lookup: {
          from: 'users',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: '$doctor' },

      // 3. Lookup specialist details
      {
        $lookup: {
          from: 'users',
          localField: 'specialistId',
          foreignField: '_id',
          as: 'specialist'
        }
      },
      { $unwind: '$specialist' },

      // 4. Lookup plans by this doctor for this patient
      {
        $lookup: {
          from: 'planbydoctors',
          let: { docId: '$doctorId', patId: '$patientId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$createdBy', '$$docId'] },
                    { $eq: ['$patientId', '$$patId'] },
                    { $ne: ['$isDeleted', true] }
                  ]
                }
              }
            },
            { $count: 'planCount' }
          ],
          as: 'plans'
        }
      },
      {
        $addFields: {
          totalPlans: { $ifNull: [{ $arrayElemAt: ['$plans.planCount', 0] }, 0] }
        }
      },

      // 5. Project needed fields
      {
        $project: {
          _id: 0,
          doctorId: 1,
          specialistId: 1,
          patientId: 1,
          totalPlans: 1,

          // doctor fields
          'doctor.name': 1,
          'doctor.profileImage': 1,

          // specialist fields
          'specialist.name': 1,
          'specialist.profileImage': 1
        }
      }
    ];

    return await DoctorSpecialistPatient.aggregate(pipeline);
  }
}
