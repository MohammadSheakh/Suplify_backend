import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../__Generic/generic.controller';
import { SpecialistWorkoutClassSchedule } from './SpecialistWorkoutClassSchedule.model';
import { ISpecialistWorkoutClassSchedule } from './SpecialistWorkoutClassSchedule.interface';
import { SpecialistWorkoutClassScheduleService } from './SpecialistWorkoutClassSchedule.service';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class SpecialistWorkoutClassScheduleController extends GenericController<
  typeof SpecialistWorkoutClassSchedule,
  ISpecialistWorkoutClassSchedule
> {
  SpecialistWorkoutClassScheduleService = new SpecialistWorkoutClassScheduleService();

  constructor() {
    super(new SpecialistWorkoutClassScheduleService(), 'SpecialistWorkoutClassSchedule');
  }

  // add more methods here if needed or override the existing ones 
}
