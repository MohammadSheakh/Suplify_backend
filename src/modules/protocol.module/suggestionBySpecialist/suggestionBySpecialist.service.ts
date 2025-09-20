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

  async create(data:Partial<ISuggestionBySpecialist & { planId?: string }>) : Promise<any> {
    
    const suggestionBySpecialist = new SuggestionBySpecialist({
      keyPoint: data.keyPoint,
      solutionName : data.solutionName,
      suggestFromStore: data.suggestFromStore,
      createdBy : data.createdBy, // specialist id
    })
    let suggestionBySpecialistSaved = await suggestionBySpecialist.save();

    /*****
     * lets create specialist suggestion for a plan
     * ***** */
    const specialistSugguestionForAPlanRelation = 
      await specialistSuggestionForAPlanService.create({
        suggestionId: suggestionBySpecialistSaved._id,
        planId: data.planId,
        createdBy: data.createdBy
      })

    return 
  }

  
}
