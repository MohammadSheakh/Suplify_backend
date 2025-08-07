import { StatusCodes } from 'http-status-codes';
import { SuggestionBySpecialist } from './SuggestionBySpecialist.model';
import { ISuggestionBySpecialist } from './SuggestionBySpecialist.interface';
import { GenericService } from '../__Generic/generic.services';


export class SuggestionBySpecialistService extends GenericService<
  typeof SuggestionBySpecialist,
  ISuggestionBySpecialist
> {
  constructor() {
    super(SuggestionBySpecialist);
  }
}
