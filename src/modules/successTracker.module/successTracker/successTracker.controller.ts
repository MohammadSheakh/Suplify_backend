//@ts-ignore
import { Request, Response } from 'express';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { SuccessTracker } from './successTracker.model';
import { ISuccessTracker } from './successTracker.interface';
import { SuccessTrackerService } from './successTracker.service';
import catchAsync from '../../../shared/catchAsync';
import moment from 'moment';
import { SuccessTrackerServiceV2 } from './successTrackerV2.service';
import { SuccessTrackerServiceV3 } from './successTrackerV3.service';
import { SuccessTrackerServiceV4 } from './successTrackerV4.service';

let successTrackerService = new SuccessTrackerService();
let successTrackerServiceV2 = new SuccessTrackerServiceV2();
let successTrackerServiceV3 = new SuccessTrackerServiceV3();
let successTrackerServiceV4 = new SuccessTrackerServiceV4();

export class SuccessTrackerController extends GenericController<
  typeof SuccessTracker,
  ISuccessTracker
> {

  constructor() {
    super(successTrackerService, 'SuccessTracker');
  }

   getSuccessTrackerOverview= catchAsync(async (req: Request, res: Response): Promise<any> => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const overview = await successTrackerService
        .getSuccessTrackerOverview(userId);
      
      return res.status(200).json({
        success: true,
        data: overview,
        message: 'Success tracker overview retrieved successfully'
      });
      
    } catch (error) {
      console.error('Error getting success tracker overview:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  })

  //🟢🟢 
  // Get Success Tracker Details for a specific week
  getSuccessTrackerDetails= catchAsync(async (req: Request, res: Response): Promise<any> => {
    try {
      const { userId, weekOffset } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const details = await successTrackerServiceV4.
      getSuccessTrackerOverview(userId)

      // const details = await successTrackerServiceV3.
      // getSuccessTrackerOverview(userId)
      //getSuccessTrackerDetails(userId, parseInt(weekOffset) || 0);
      
      return res.status(200).json({
        success: true,
        data: details,
        message: 'Success tracker details retrieved successfully'
      });
      
    } catch (error) {
      console.error('Error getting success tracker details:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  })

 
// Create new success tracker entry
  createSuccessTracker = catchAsync(async (req: Request, res: Response): Promise<any> => {
    try {
      
      const userId = req.user.userId; // Assuming user ID is available in req.user
      const result = await successTrackerService.createSuccessTracker(userId, req.body);
      
      return res.status(201).json({
        success: true,
        message: 'Success tracker created successfully',
        data: result
      });
      
    } catch (error) {
      console.error('Error creating success tracker:', error);
      
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  })

  // add more methods here if needed or override the existing ones 
}
