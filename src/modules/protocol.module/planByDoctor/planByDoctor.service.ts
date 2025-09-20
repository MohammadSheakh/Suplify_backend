//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { PlanByDoctor } from './planByDoctor.model';
import { IPlanByDoctor } from './planByDoctor.interface';
import { GenericService } from '../../_generic-module/generic.services';
//@ts-ignore
import mongoose from 'mongoose';


export class PlanByDoctorService extends GenericService<
  typeof PlanByDoctor,
  IPlanByDoctor
> {
  constructor() {
    super(PlanByDoctor);
  }

  /**********
   * 
   * Specialist | Members and protocol | Get a plan with suggestions .. 
   *  :planId: :specialistId:
   * 
   * logged in specialist only can see his suggestions
   * 
   * TODO : later we need to implement for patient to see all specialist's
   * suggestions for a plan
   * 
   * ********* */
  async getAPlanWithSuggestions(planId: string, specialistId: string) {

    //📈⚙️
    const result = await PlanByDoctor.aggregate([
      // 1. Match the specific plan
      {
        $match: {
          _id: new mongoose.Types.ObjectId(planId),
          isDeleted: { $ne: true }
        }
      },
      // 2. Lookup specialist suggestions for this plan
      {
        $lookup: {
          from: "specialistsuggestionforaplans", // collection name
          let: { planId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$planId", "$$planId"] },
                    { $eq: ["$createdBy", new mongoose.Types.ObjectId(specialistId)] }, // filter by specialist
                    { $ne: ["$isDeleted", true] }
                  ]
                }
              }
            },
            // 3. Lookup actual suggestion details
            {
              $lookup: {
                from: "suggestionbyspecialists", // collection name
                let: { suggestionId: "$suggestionId" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$_id", "$$suggestionId"] },
                          { $eq: ["$createdBy", new mongoose.Types.ObjectId(specialistId)] },
                          { $ne: ["$isDeleted", true] }
                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      _id: 1,
                      keyPoint: 1,
                      solutionName: 1,
                      suggestFromStore: 1,
                      // createdBy: 1
                    }
                  }
                ],
                as: "suggestionDetails"
              }
            },
            {
              $unwind: {
                path: "$suggestionDetails",
                preserveNullAndEmptyArrays: true
              }
            },
            // 🔥 Clean unwanted fields from specialistSuggestions
            {
              $project: {
                _id: 1,
                // suggestionId: 1,
                // planId: 1,
                // createdBy: 1,
                suggestionDetails: 1
              }
            }
          ],
          as: "specialistSuggestions"
        }
      },
      // 4. Shape final output
      {
        $project: {
          _id: 1,
          planType: 1,
          title: 1,
          description: 1,
          keyPoints: 1,
          totalKeyPoints: 1,
          // patientId: 1,
          // protocolId: 1,
          specialistSuggestions: 1
        }
      }
    ]);

    return result; 
  }

}
