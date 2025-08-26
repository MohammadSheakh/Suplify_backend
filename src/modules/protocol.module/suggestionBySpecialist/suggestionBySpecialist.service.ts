import { StatusCodes } from 'http-status-codes';
import { SuggestionBySpecialist } from './suggestionBySpecialist.model';
import { ISuggestionBySpecialist } from './suggestionBySpecialist.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class SuggestionBySpecialistService extends GenericService<
  typeof SuggestionBySpecialist,
  ISuggestionBySpecialist
> {
  constructor() {
    super(SuggestionBySpecialist);
  }
}
