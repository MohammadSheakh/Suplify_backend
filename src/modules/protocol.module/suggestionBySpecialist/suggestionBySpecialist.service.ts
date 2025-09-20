//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { SuggestionBySpecialist } from './suggestionBySpecialist.model';
import { ISuggestionBySpecialist } from './suggestionBySpecialist.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { SpecialistSuggestionForAPlan } from '../specialistSuggestionForAPlan/specialistSuggestionForAPlan.model';
import { SpecialistSuggestionForAPlanService } from '../specialistSuggestionForAPlan/specialistSuggestionForAPlan.service';


let specialistSuggestionForAPlanService = new SpecialistSuggestionForAPlanService();

export class SuggestionBySpecialistService extends GenericService<
  typeof SuggestionBySpecialist,
  ISuggestionBySpecialist
> {
  constructor() {
    super(SuggestionBySpecialist);
  }

  async create(
    data:(Partial<ISuggestionBySpecialist> | undefined)[],
    specialistId: string,
    planId :string
    ) : Promise<any> {
    //  & { planId?: string }

  
    // TODO : need to add mongoose transaction here

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

  
    console.log("✅ insertedSuggestions", insertedSuggestions);


    /*****
     * lets create specialist suggestion for a plan
     * ***** */

    // 3️⃣ Prepare the relations for each inserted suggestion
    const relationsToInsert = insertedSuggestions.map((suggestion : ISuggestionBySpecialist, index : number) => ({
      suggestionId: suggestion._id,
      planId,
      createdBy: specialistId,
    }));

    console.log("✅ relationsToInsert", relationsToInsert);

    await SpecialistSuggestionForAPlan.insertMany(relationsToInsert);

    
    return 
  }

  
}
