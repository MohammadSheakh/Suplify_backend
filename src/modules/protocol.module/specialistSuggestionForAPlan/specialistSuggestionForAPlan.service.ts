import { StatusCodes } from 'http-status-codes';
import { SpecialistSuggestionForAPlan } from './specialistSuggestionForAPlan.model';
import { ISpecialistSuggestionForAPlan } from './specialistSuggestionForAPlan.interface';
import { GenericService } from '../../__Generic/generic.services';

export class SpecialistSuggestionForAPlanService extends GenericService<
  typeof SpecialistSuggestionForAPlan,
  ISpecialistSuggestionForAPlan
> {
  constructor() {
    super(SpecialistSuggestionForAPlan);
  }
}
