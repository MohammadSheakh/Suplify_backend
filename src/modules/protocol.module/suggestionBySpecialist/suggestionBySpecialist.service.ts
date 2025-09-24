//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { SuggestionBySpecialist } from './suggestionBySpecialist.model';
import { ISuggestionBySpecialist } from './suggestionBySpecialist.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { SpecialistSuggestionForAPlan } from '../specialistSuggestionForAPlan/specialistSuggestionForAPlan.model';
import { SpecialistSuggestionForAPlanService } from '../specialistSuggestionForAPlan/specialistSuggestionForAPlan.service';
import { DoctorSpecialistPatient } from '../../personRelationships.module/doctorSpecialistPatient/doctorSpecialistPatient.model';
import { PlanByDoctor } from '../planByDoctor/planByDoctor.model';
import ApiError from '../../../errors/ApiError';
import { IPlanByDoctor } from '../planByDoctor/planByDoctor.interface';


let specialistSuggestionForAPlanService = new SpecialistSuggestionForAPlanService();

export class SuggestionBySpecialistService extends GenericService<
  typeof SuggestionBySpecialist,
  ISuggestionBySpecialist
> {
  constructor() {
    super(SuggestionBySpecialist);
  }

  async createV2(
    data:(Partial<ISuggestionBySpecialist> | undefined)[],
    specialistId: string,
    planId :string
    ) : Promise<any> {
    //  & { planId?: string }

  
    // TODO : need to add mongoose transaction here

    /*****
     * 📝
     * as we have planId here .. so we need to get that plan ... and plan contains "createdBy", "patientId" .. here "createdBy" is doctorId
     * 
     * so .. we need to check if doctorSpecialistPatient relationship exists or not .. if not exists .. we need to create that relationship
     * 
     * this relationship help us to find specialist + doctor information for a patient .. we need this in patient dashboard .. 
     * 
     * **** */

    const plan :IPlanByDoctor = await PlanByDoctor.findById(planId);
    if(!plan) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Plan not found');
    }

    const doctorSpecialistPatientRelationship = await DoctorSpecialistPatient.findOne({
      specialistId,
      doctorId: plan.createdBy,
      patientId: plan.patientId,
      isDeleted: { $ne: true }
    });

    if(!doctorSpecialistPatientRelationship) {
      // create the relationship
      await DoctorSpecialistPatient.create({
        specialistId,
        doctorId: plan.createdBy,
        patientId: plan.patientId,
      });
    }

    const insertedSuggestions = await SuggestionBySpecialist.insertMany(
      data.map((
        // item
        { keyPoint , solutionName, suggestFromStore, ...rest }
      ) => ({
        keyPoint,
        solutionName,
        suggestFromStore,
        createdBy: specialistId, // specialist id
      })) as ISuggestionBySpecialist[]
    );

  
    /*****
     * lets create specialist suggestion for a plan
     * ***** */

    // 3️⃣ Prepare the relations for each inserted suggestion
    const relationsToInsert = insertedSuggestions.map((suggestion : ISuggestionBySpecialist, index : number) => ({
      suggestionId: suggestion._id,
      planId,
      createdBy: specialistId,
    }));

    await SpecialistSuggestionForAPlan.insertMany(relationsToInsert);

    
    return 
  }

  
}
