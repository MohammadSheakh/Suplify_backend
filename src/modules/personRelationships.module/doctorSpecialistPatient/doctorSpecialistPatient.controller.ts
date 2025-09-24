//@ts-ignore
import { Request, Response } from 'express';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { DoctorSpecialistPatient } from './doctorSpecialistPatient.model';
import { IDoctorSpecialistPatient } from './doctorSpecialistPatient.interface';
import { DoctorSpecialistPatientService } from './doctorSpecialistPatient.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IUser } from '../../token/token.interface';

export class DoctorSpecialistPatientController extends GenericController<
  typeof DoctorSpecialistPatient,
  IDoctorSpecialistPatient
> {
  doctorSpecialistPatientService = new DoctorSpecialistPatientService();

  constructor() {
    super(new DoctorSpecialistPatientService(), 'DoctorSpecialistPatient');
  }

  /********
   * 
   * Patient | Specialist Suggestion
   * | -> For A Patient ..
   *  get all doctorSpefcialistPatient
   *   .. from those documents for every doctorId 
   *   get total plan count by createdBy(doctorId) from planByDoctor collection .. 
   * 
   * ********** */
  getAllWithSpecilistWhoGiveSuggestionToDoctorsPlan =  catchAsync(async (req: Request, res: Response) => {

    const result = await this.doctorSpecialistPatientService.getAllWithSpecilistWhoGiveSuggestionToDoctorsPlan(
      (req.user as IUser).userId, // patientId
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} updated successfully`,
    });
  });

  // add more methods here if needed or override the existing ones 
}
