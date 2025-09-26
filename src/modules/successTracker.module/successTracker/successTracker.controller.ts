//@ts-ignore
import { Request, Response } from 'express';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { SuccessTracker } from './successTracker.model';
import { ISuccessTracker } from './successTracker.interface';
import { SuccessTrackerService } from './successTracker.service';
import catchAsync from '../../../shared/catchAsync';

let successTrackerService = new SuccessTrackerService();


export class SuccessTrackerController extends GenericController<
  typeof SuccessTracker,
  ISuccessTracker
> {

  constructor() {
    super(successTrackerService, 'SuccessTracker');
  }

  // Create new success tracker entry
  createSuccessTracker = catchAsync(async (req, res) => {
    try {
      // const errors = validationResult(req);
      // if (!errors.isEmpty()) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'Validation error',
      //     errors: errors.array()
      //   });
      // }
      
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




  // ========================
  // CONTROLLER METHOD ADDITIONS           START
  // ========================

// Add these methods to your SuccessTrackerController class


  // Get overview comparison (last 2 weeks by default)
  async getOverview(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const result = await this.successTrackerService.getOverviewComparison(userId);
      
      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Success tracker overview retrieved successfully',
        data: result
      });
      
    } catch (error) {
      console.error('Error getting success tracker overview:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get available weeks for user
  async getAvailableWeeks(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await this.successTrackerService.getAvailableWeeks(userId, limit);
      
      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Available weeks retrieved successfully',
        data: result
      });
      
    } catch (error) {
      console.error('Error getting available weeks:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get custom week comparison
  async getCustomWeekComparison(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const { week1, week2 } = req.query;
      
      if (!week1 || !week2) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Both week1 and week2 parameters are required'
        });
      }

      const result = await this.successTrackerService.getCustomWeekComparison(
        userId, 
        week1 as string, 
        week2 as string
      );
      
      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Custom week comparison retrieved successfully',
        data: result
      });
      
    } catch (error) {
      console.error('Error getting custom week comparison:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }




  // ========================
  // CONTROLLER METHOD ADDITIONS         END
  // ========================


  
  // Get current and previous week comparison
  async getWeeklyComparison(req, res) {
    try {
      const userId = req.user.id;
      const result = await successTrackerService.getSuccessTrackerComparison(userId);
      
      return res.status(200).json({
        success: true,
        message: 'Weekly comparison retrieved successfully',
        data: result
      });
      
    } catch (error) {
      console.error('Error getting weekly comparison:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  // Update current week's success tracker
  async updateSuccessTracker(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }
      
      const userId = req.user.id;
      const result = await successTrackerService.updateSuccessTracker(userId, req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Success tracker updated successfully',
        data: result
      });
      
    } catch (error) {
      console.error('Error updating success tracker:', error);
      
      if (error.message.includes('No success tracker found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  // Get historical data
  async getHistoricalData(req, res) {
    try {
      const userId = req.user.id;
      const weeks = parseInt(req.query.weeks) || 4;
      
      const result = await successTrackerService.getHistoricalData(userId, weeks);
      
      return res.status(200).json({
        success: true,
        message: 'Historical data retrieved successfully',
        data: result
      });
      
    } catch (error) {
      console.error('Error getting historical data:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  // Get progress trends
  async getProgressTrends(req, res) {
    try {
      const userId = req.user.id;
      const weeks = parseInt(req.query.weeks) || 8;
      
      const historicalData = await successTrackerService.getHistoricalData(userId, weeks);
      
      // Calculate trends over time
      const trends = this.calculateTrends(historicalData);
      
      return res.status(200).json({
        success: true,
        message: 'Progress trends retrieved successfully',
        data: trends
      });
      
    } catch (error) {
      console.error('Error getting progress trends:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  calculateTrends(historicalData) {
    if (historicalData.length < 2) {
      return { message: 'Insufficient data for trend analysis' };
    }
    
    const trends = {
      weight: [],
      bodyFat: [],
      waistMeasurement: [],
      energyLevel: [],
      sleepQuality: [],
      workoutRecovery: [],
      motivation: [],
      confidence: []
    };
    
    historicalData.reverse().forEach((week, index) => {
      const health = week.data.healthAndPerformance;
      const mindset = week.data.mindsetAndMomentum;
      
      if (health) {
        trends.weight.push({ week: index + 1, value: health.currentWeight });
        trends.bodyFat.push({ week: index + 1, value: health.bodyFatPercentage });
        trends.waistMeasurement.push({ week: index + 1, value: health.waistMeasurement });
        trends.energyLevel.push({ week: index + 1, value: health.energyLevel });
        trends.sleepQuality.push({ week: index + 1, value: health.sleepQuality });
        trends.workoutRecovery.push({ week: index + 1, value: health.workoutRecoveryRating });
      }
      
      if (mindset) {
        trends.motivation.push({ week: index + 1, value: mindset.howMotivatedDoYouFeel });
        trends.confidence.push({ week: index + 1, value: mindset.howConfidentAreYou });
      }
    });
    
    return trends;
  }




  // add more methods here if needed or override the existing ones 
}
