import { StatusCodes } from 'http-status-codes';
import { SpecialistSuggestionForAPlan } from './SpecialistSuggestionForAPlan.model';
import { ISpecialistSuggestionForAPlan } from './SpecialistSuggestionForAPlan.interface';
import { GenericService } from '../__Generic/generic.services';


export class SpecialistSuggestionForAPlanService extends GenericService<
  typeof SpecialistSuggestionForAPlan,
  ISpecialistSuggestionForAPlan
> {
  constructor() {
    super(SpecialistSuggestionForAPlan);
  }
}
