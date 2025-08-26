import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { SpecialistWorkoutClassSchedule } from './specialistWorkoutClassSchedule.model';
import { ISpecialistWorkoutClassSchedule } from './specialistWorkoutClassSchedule.interface';
import { SpecialistWorkoutClassScheduleService } from './specialistWorkoutClassSchedule.service';

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
