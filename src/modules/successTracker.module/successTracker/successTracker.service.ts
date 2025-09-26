//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { SuccessTracker } from './successTracker.model';
import { ISuccessTracker } from './successTracker.interface';
import { GenericService } from '../../_generic-module/generic.services';
//@ts-ignore
import moment from 'moment';
import { HealthAndPerformance } from '../healthAndPerformance/healthAndPerformance.model';
import { MindsetAndMomentum } from '../mindsetAndMomentum/mindsetAndMomentum.model';
import { SatisfactionAndFeedback } from '../satisfactionAndFeedback/satisfactionAndFeedback.model';
import { AdherenceAndConsistency } from '../adherenceAndConsistency/adherenceAndConsistency.model';

export class SuccessTrackerService extends GenericService<
  typeof SuccessTracker,
  ISuccessTracker
> {
  constructor() {
    super(SuccessTracker);
  }

  async createSuccessTracker(userId, data) {
    try {
      // Get current week start and end dates
      const weekStart = moment().startOf('week').toDate();
      const weekEnd = moment().endOf('week').toDate();
      
      // Check if entry already exists for current week
      const existingTracker = await SuccessTracker.findOne({
        createdBy: userId,
        weekStartDate: { $gte: weekStart, $lte: weekEnd },
        isDeleted: false
      });
      
      if (existingTracker) {
        throw new Error('Success tracker already exists for this week');
      }
      
      // Create main tracker entry
      const successTracker = new SuccessTracker({
        createdBy: userId,
        weekStartDate: weekStart,
        weekEndDate: weekEnd
      });
      
      await successTracker.save();
      
      // Create all category entries
      const promises = [];
      
      // Health and Performance
      if (data.healthAndPerformance) {
        const healthEntry = new HealthAndPerformance({
          successTrackerId: successTracker._id,
          ...data.healthAndPerformance
        });
        promises.push(healthEntry.save());
      }
      
      // Mindset and Momentum
      if (data.mindsetAndMomentum) {
        const mindsetEntry = new MindsetAndMomentum({
          successTrackerId: successTracker._id,
          ...data.mindsetAndMomentum
        });
        promises.push(mindsetEntry.save());
      }
      
      // Satisfaction and Feedback
      if (data.satisfactionAndFeedback) {
        const satisfactionEntry = new SatisfactionAndFeedback({
          successTrackerId: successTracker._id,
          ...data.satisfactionAndFeedback
        });
        promises.push(satisfactionEntry.save());
      }
      
      // Adherence and Consistency
      if (data.adherenceAndConsistency) {
        const adherenceEntry = new AdherenceAndConsistency({
          successTrackerId: successTracker._id,
          ...data.adherenceAndConsistency
        });
        promises.push(adherenceEntry.save());
      }
      
      await Promise.all(promises);
      
      return await this.getSuccessTrackerComparison(userId);
      
    } catch (error) {
      throw error;
    }
  }

  ///////////////////////////////////////// START


  // Get overview data for last 2 weeks comparison
  async getOverviewComparison(userId: string) {
    try {
      // Get current week dates
      const currentWeekStart = moment().startOf('week').toDate();
      const currentWeekEnd = moment().endOf('week').toDate();
      
      // Get previous week dates
      const previousWeekStart = moment().subtract(1, 'week').startOf('week').toDate();
      const previousWeekEnd = moment().subtract(1, 'week').endOf('week').toDate();
      
      // Find current week tracker
      const currentTracker = await SuccessTracker.findOne({
        createdBy: userId,
        weekStartDate: { $gte: currentWeekStart, $lte: currentWeekEnd },
        isDeleted: false
      });
      
      // Find previous week tracker
      const previousTracker = await SuccessTracker.findOne({
        createdBy: userId,
        weekStartDate: { $gte: previousWeekStart, $lte: previousWeekEnd },
        isDeleted: false
      });
      
      let currentWeekData = null;
      let previousWeekData = null;
      
      // Get current week data if exists
      if (currentTracker) {
        currentWeekData = await this.getWeekData(currentTracker._id);
      }
      
      // Get previous week data if exists
      if (previousTracker) {
        previousWeekData = await this.getWeekData(previousTracker._id);
      }
      
      // Calculate progress scores and changes
      const progressAnalysis = this.calculateProgressScores(currentWeekData, previousWeekData);
      
      // Format data for overview display
      const overviewData = this.formatOverviewData(currentWeekData, previousWeekData, progressAnalysis);
      
      return {
        weekInfo: {
          currentWeek: currentTracker ? {
            weekStartDate: currentTracker.weekStartDate,
            weekEndDate: currentTracker.weekEndDate
          } : null,
          previousWeek: previousTracker ? {
            weekStartDate: previousTracker.weekStartDate,
            weekEndDate: previousTracker.weekEndDate
          } : null
        },
        categoryScores: {
          healthAndPerformance: {
            score: progressAnalysis.healthScore.current,
            change: progressAnalysis.healthScore.change,
            trend: progressAnalysis.healthScore.trend
          },
          adherenceAndConsistency: {
            score: progressAnalysis.adherenceScore.current,
            change: progressAnalysis.adherenceScore.change,
            trend: progressAnalysis.adherenceScore.trend
          },
          mindsetAndMomentum: {
            score: progressAnalysis.mindsetScore.current,
            change: progressAnalysis.mindsetScore.change,
            trend: progressAnalysis.mindsetScore.trend
          },
          satisfactionAndFeedback: {
            score: progressAnalysis.satisfactionScore.current,
            change: progressAnalysis.satisfactionScore.change,
            trend: progressAnalysis.satisfactionScore.trend
          }
        },
        overviewTable: overviewData,
        overallScore: progressAnalysis.overallScore
      };
      
    } catch (error) {
      throw error;
    }
  }

  // Format data for overview table display
  formatOverviewData(currentData: any, previousData: any, progressAnalysis: any) {
    const tableData = [];

    // Health & Performance Section
    if (currentData?.healthAndPerformance || previousData?.healthAndPerformance) {
      tableData.push({
        slNo: 1,
        question: "Weight",
        previousWeek: previousData?.healthAndPerformance?.currentWeight || '-',
        lastWeek: currentData?.healthAndPerformance?.currentWeight || '-',
        category: 'health'
      });

      tableData.push({
        slNo: 2,
        question: "Body Fat Percentage",
        previousWeek: previousData?.healthAndPerformance?.bodyFatPercentage ? `${previousData.healthAndPerformance.bodyFatPercentage}%` : '-',
        lastWeek: currentData?.healthAndPerformance?.bodyFatPercentage ? `${currentData.healthAndPerformance.bodyFatPercentage}%` : '-',
        category: 'health'
      });

      tableData.push({
        slNo: 3,
        question: "Waist Measurement (in inches)",
        previousWeek: previousData?.healthAndPerformance?.waistMeasurement || '-',
        lastWeek: currentData?.healthAndPerformance?.waistMeasurement || '-',
        category: 'health'
      });

      tableData.push({
        slNo: 4,
        question: "Energy Level (1-10)",
        previousWeek: previousData?.healthAndPerformance?.energyLevel || '-',
        lastWeek: currentData?.healthAndPerformance?.energyLevel || '-',
        category: 'health'
      });

      tableData.push({
        slNo: 5,
        question: "Sleep Quality (Past 7 Days)",
        previousWeek: previousData?.healthAndPerformance?.sleepQuality || '-',
        lastWeek: currentData?.healthAndPerformance?.sleepQuality || '-',
        category: 'health'
      });

      tableData.push({
        slNo: 6,
        question: "Workout Recovery Rating",
        previousWeek: previousData?.healthAndPerformance?.workoutRecoveryRating || '-',
        lastWeek: currentData?.healthAndPerformance?.workoutRecoveryRating || '-',
        category: 'health'
      });
    }

    // Adherence & Consistency Section
    if (currentData?.adherenceAndConsistency || previousData?.adherenceAndConsistency) {
      tableData.push({
        slNo: 7,
        question: "Supplement Intake Consistency",
        previousWeek: previousData?.adherenceAndConsistency?.didYouTakeSupplimentsAsRecommended ? `${previousData.adherenceAndConsistency.didYouTakeSupplimentsAsRecommended}%` : '-',
        lastWeek: currentData?.adherenceAndConsistency?.didYouTakeSupplimentsAsRecommended ? `${currentData.adherenceAndConsistency.didYouTakeSupplimentsAsRecommended}%` : '-',
        category: 'adherence'
      });

      tableData.push({
        slNo: 8,
        question: "Meals Followed from Nutrition Plan",
        previousWeek: previousData?.adherenceAndConsistency?.howManyMealsDidYouFollow ? `${previousData.adherenceAndConsistency.howManyMealsDidYouFollow}/21` : '-',
        lastWeek: currentData?.adherenceAndConsistency?.howManyMealsDidYouFollow ? `${currentData.adherenceAndConsistency.howManyMealsDidYouFollow}/21` : '-',
        category: 'adherence'
      });

      tableData.push({
        slNo: 9,
        question: "Workouts Completed This Week",
        previousWeek: previousData?.adherenceAndConsistency?.workoutDidYouCompleteThisWeek || '-',
        lastWeek: currentData?.adherenceAndConsistency?.workoutDidYouCompleteThisWeek || '-',
        category: 'adherence'
      });

      tableData.push({
        slNo: 10,
        question: "Hydration Consistency",
        previousWeek: previousData?.adherenceAndConsistency?.howConsistentWithHydration || '-',
        lastWeek: currentData?.adherenceAndConsistency?.howConsistentWithHydration || '-',
        category: 'adherence'
      });

      tableData.push({
        slNo: 11,
        question: "Coach or Plan Check-in Status",
        previousWeek: previousData?.adherenceAndConsistency?.checkInWithCoachThisWeek ? 'Yes' : (previousData?.adherenceAndConsistency?.checkInWithCoachThisWeek === false ? 'No' : '-'),
        lastWeek: currentData?.adherenceAndConsistency?.checkInWithCoachThisWeek ? 'Yes' : (currentData?.adherenceAndConsistency?.checkInWithCoachThisWeek === false ? 'No' : '-'),
        category: 'adherence'
      });
    }

    // Mindset & Momentum Section
    if (currentData?.mindsetAndMomentum || previousData?.mindsetAndMomentum) {
      tableData.push({
        slNo: 12,
        question: "Motivation Level for Upcoming Week",
        previousWeek: previousData?.mindsetAndMomentum?.howMotivatedDoYouFeel || '-',
        lastWeek: currentData?.mindsetAndMomentum?.howMotivatedDoYouFeel || '-',
        category: 'mindset'
      });

      tableData.push({
        slNo: 13,
        question: "Win Highlight",
        previousWeek: previousData?.mindsetAndMomentum?.oneWinFromPastWeekThatYourProudOf || '-',
        lastWeek: currentData?.mindsetAndMomentum?.oneWinFromPastWeekThatYourProudOf || '-',
        category: 'mindset'
      });

      tableData.push({
        slNo: 14,
        question: "Biggest Weekly Challenge",
        previousWeek: previousData?.mindsetAndMomentum?.biggestChallengeofThisWeek || '-',
        lastWeek: currentData?.mindsetAndMomentum?.biggestChallengeofThisWeek || '-',
        category: 'mindset'
      });

      tableData.push({
        slNo: 15,
        question: "Improved or Built Habit",
        previousWeek: previousData?.mindsetAndMomentum?.oneHabitYouImprovedOrBuiltThisWeek || '-',
        lastWeek: currentData?.mindsetAndMomentum?.oneHabitYouImprovedOrBuiltThisWeek || '-',
        category: 'mindset'
      });

      tableData.push({
        slNo: 16,
        question: "Confidence in Staying on Track",
        previousWeek: previousData?.mindsetAndMomentum?.howConfidentAreYou || '-',
        lastWeek: currentData?.mindsetAndMomentum?.howConfidentAreYou || '-',
        category: 'mindset'
      });
    }

    // Satisfaction & Feedback Section
    if (currentData?.satisfactionAndFeedback || previousData?.satisfactionAndFeedback) {
      tableData.push({
        slNo: 17,
        question: "Satisfaction with Current Progress",
        previousWeek: previousData?.satisfactionAndFeedback?.areYouHappyWithCurrentProgress ? 'Yes' : (previousData?.satisfactionAndFeedback?.areYouHappyWithCurrentProgress === false ? 'No' : '-'),
        lastWeek: currentData?.satisfactionAndFeedback?.areYouHappyWithCurrentProgress ? 'Yes' : (currentData?.satisfactionAndFeedback?.areYouHappyWithCurrentProgress === false ? 'No' : '-'),
        category: 'satisfaction'
      });

      tableData.push({
        slNo: 18,
        question: "Feeling of Support from Coach/System",
        previousWeek: previousData?.satisfactionAndFeedback?.doYouFeelSupported ? 'Yes' : (previousData?.satisfactionAndFeedback?.doYouFeelSupported === false ? 'No' : '-'),
        lastWeek: currentData?.satisfactionAndFeedback?.doYouFeelSupported ? 'Yes' : (currentData?.satisfactionAndFeedback?.doYouFeelSupported === false ? 'No' : '-'),
        category: 'satisfaction'
      });

      tableData.push({
        slNo: 19,
        question: "Area Needing Help or Adjustment",
        previousWeek: previousData?.satisfactionAndFeedback?.oneThingYouNeedHelpWith || '-',
        lastWeek: currentData?.satisfactionAndFeedback?.oneThingYouNeedHelpWith || '-',
        category: 'satisfaction'
      });

      tableData.push({
        slNo: 20,
        question: "Willingness to Recommend Suplify",
        previousWeek: previousData?.satisfactionAndFeedback?.wouldYouRecommendUs ? 'Yes' : (previousData?.satisfactionAndFeedback?.wouldYouRecommendUs === false ? 'No' : '-'),
        lastWeek: currentData?.satisfactionAndFeedback?.wouldYouRecommendUs ? 'Yes' : (currentData?.satisfactionAndFeedback?.wouldYouRecommendUs === false ? 'No' : '-'),
        category: 'satisfaction'
      });
    }

    return tableData;
  }

  // Get all available weeks for a user (for dropdown or selection)
  async getAvailableWeeks(userId: string, limit: number = 10) {
    try {
      const trackers = await SuccessTracker.find({
        createdBy: userId,
        isDeleted: false
      })
      .sort({ weekStartDate: -1 })
      .limit(limit)
      .select('weekStartDate weekEndDate createdAt');

      return trackers.map(tracker => ({
        id: tracker._id,
        weekStartDate: tracker.weekStartDate,
        weekEndDate: tracker.weekEndDate,
        weekLabel: `Week of ${moment(tracker.weekStartDate).format('MMM DD, YYYY')}`,
        createdAt: tracker.createdAt
      }));

    } catch (error) {
      throw error;
    }
  }

  // Get custom week comparison (any two weeks)
  async getCustomWeekComparison(userId: string, week1Date: string, week2Date: string) {
    try {
      // Parse dates and get week boundaries
      const week1Start = moment(week1Date).startOf('week').toDate();
      const week1End = moment(week1Date).endOf('week').toDate();
      const week2Start = moment(week2Date).startOf('week').toDate();
      const week2End = moment(week2Date).endOf('week').toDate();
      
      // Find trackers for both weeks
      const [tracker1, tracker2] = await Promise.all([
        SuccessTracker.findOne({
          createdBy: userId,
          weekStartDate: { $gte: week1Start, $lte: week1End },
          isDeleted: false
        }),
        SuccessTracker.findOne({
          createdBy: userId,
          weekStartDate: { $gte: week2Start, $lte: week2End },
          isDeleted: false
        })
      ]);

      let week1Data = null;
      let week2Data = null;

      // Get data for both weeks
      if (tracker1) {
        week1Data = await this.getWeekData(tracker1._id);
      }
      if (tracker2) {
        week2Data = await this.getWeekData(tracker2._id);
      }

      // Calculate progress between the two weeks
      const progressAnalysis = this.calculateProgressScores(week1Data, week2Data);
      
      // Format data for overview display
      const overviewData = this.formatOverviewData(week1Data, week2Data, progressAnalysis);

      return {
        weekInfo: {
          week1: tracker1 ? {
            weekStartDate: tracker1.weekStartDate,
            weekEndDate: tracker1.weekEndDate,
            label: `Week of ${moment(tracker1.weekStartDate).format('MMM DD, YYYY')}`
          } : null,
          week2: tracker2 ? {
            weekStartDate: tracker2.weekStartDate,
            weekEndDate: tracker2.weekEndDate,
            label: `Week of ${moment(tracker2.weekStartDate).format('MMM DD, YYYY')}`
          } : null
        },
        categoryScores: {
          healthAndPerformance: {
            score: progressAnalysis.healthScore.current,
            change: progressAnalysis.healthScore.change,
            trend: progressAnalysis.healthScore.trend
          },
          adherenceAndConsistency: {
            score: progressAnalysis.adherenceScore.current,
            change: progressAnalysis.adherenceScore.change,
            trend: progressAnalysis.adherenceScore.trend
          },
          mindsetAndMomentum: {
            score: progressAnalysis.mindsetScore.current,
            change: progressAnalysis.mindsetScore.change,
            trend: progressAnalysis.mindsetScore.trend
          },
          satisfactionAndFeedback: {
            score: progressAnalysis.satisfactionScore.current,
            change: progressAnalysis.satisfactionScore.change,
            trend: progressAnalysis.satisfactionScore.trend
          }
        },
        overviewTable: overviewData,
        overallScore: progressAnalysis.overallScore
      };

    } catch (error) {
      throw error;
    }
  }




  /////////////////////////////////////////// END



  // Get current and previous week comparison
  async getSuccessTrackerComparison(userId) {
    try {
      // Get current week dates
      const currentWeekStart = moment().startOf('week').toDate();
      const currentWeekEnd = moment().endOf('week').toDate();
      
      // Get previous week dates
      const previousWeekStart = moment().subtract(1, 'week').startOf('week').toDate();
      const previousWeekEnd = moment().subtract(1, 'week').endOf('week').toDate();
      
      // Find current week tracker
      const currentTracker = await SuccessTracker.findOne({
        createdBy: userId,
        weekStartDate: { $gte: currentWeekStart, $lte: currentWeekEnd },
        isDeleted: false
      });
      
      // Find previous week tracker
      const previousTracker = await SuccessTracker.findOne({
        createdBy: userId,
        weekStartDate: { $gte: previousWeekStart, $lte: previousWeekEnd },
        isDeleted: false
      });
      
      let currentWeekData = null;
      let previousWeekData = null;
      
      // Get current week data if exists
      if (currentTracker) {
        currentWeekData = await this.getWeekData(currentTracker._id);
      }
      
      // Get previous week data if exists
      if (previousTracker) {
        previousWeekData = await this.getWeekData(previousTracker._id);
      }
      
      // Calculate progress scores
      const progressAnalysis = this.calculateProgressScores(currentWeekData, previousWeekData);
      
      return {
        currentWeek: {
          weekInfo: currentTracker ? {
            weekStartDate: currentTracker.weekStartDate,
            weekEndDate: currentTracker.weekEndDate
          } : null,
          data: currentWeekData
        },
        previousWeek: {
          weekInfo: previousTracker ? {
            weekStartDate: previousTracker.weekStartDate,
            weekEndDate: previousTracker.weekEndDate
          } : null,
          data: previousWeekData
        },
        progressAnalysis
      };
      
    } catch (error) {
      throw error;
    }
  }


  // Get all data for a specific week
  async getWeekData(successTrackerId) {
    try {
      const [health, mindset, satisfaction, adherence] = await Promise.all([
        HealthAndPerformance.findOne({ successTracker_id: successTrackerId, isDeleted: false }),
        MindsetAndMomentum.findOne({ successTracker_id: successTrackerId, isDeleted: false }),
        SatisfactionAndFeedback.findOne({ successTracker_id: successTrackerId, isDeleted: false }),
        AdherenceAndConsistency.findOne({ successTracker_id: successTrackerId, isDeleted: false })
      ]);
      
      return {
        healthAndPerformance: health,
        mindsetAndMomentum: mindset,
        satisfactionAndFeedback: satisfaction,
        adherenceAndConsistency: adherence
      };
      
    } catch (error) {
      throw error;
    }
  }

  // Calculate progress scores and changes
  calculateProgressScores(currentData, previousData) {
    if (!currentData || !previousData) {
      return {
        healthScore: { current: 0, previous: 0, change: 0, trend: 'neutral' },
        adherenceScore: { current: 0, previous: 0, change: 0, trend: 'neutral' },
        mindsetScore: { current: 0, previous: 0, change: 0, trend: 'neutral' },
        satisfactionScore: { current: 0, previous: 0, change: 0, trend: 'neutral' },
        overallScore: { current: 0, previous: 0, change: 0, trend: 'neutral' }
      };
    }
    
    // Health & Performance Score (out of 100)
    const currentHealthScore = this.calculateHealthScore(currentData.healthAndPerformance);
    const previousHealthScore = this.calculateHealthScore(previousData.healthAndPerformance);
    
    // Adherence & Consistency Score (out of 100)
    const currentAdherenceScore = this.calculateAdherenceScore(currentData.adherenceAndConsistency);
    const previousAdherenceScore = this.calculateAdherenceScore(previousData.adherenceAndConsistency);
    
    // Mindset & Momentum Score (out of 100)
    const currentMindsetScore = this.calculateMindsetScore(currentData.mindsetAndMomentum);
    const previousMindsetScore = this.calculateMindsetScore(previousData.mindsetAndMomentum);
    
    // Satisfaction Score (out of 100)
    const currentSatisfactionScore = this.calculateSatisfactionScore(currentData.satisfactionAndFeedback);
    const previousSatisfactionScore = this.calculateSatisfactionScore(previousData.satisfactionAndFeedback);
    
    // Overall Score
    const currentOverallScore = Math.round((currentHealthScore + currentAdherenceScore + currentMindsetScore + currentSatisfactionScore) / 4);
    const previousOverallScore = Math.round((previousHealthScore + previousAdherenceScore + previousMindsetScore + previousSatisfactionScore) / 4);
    
    return {
      healthScore: {
        current: currentHealthScore,
        previous: previousHealthScore,
        change: currentHealthScore - previousHealthScore,
        trend: this.getTrend(currentHealthScore - previousHealthScore)
      },
      adherenceScore: {
        current: currentAdherenceScore,
        previous: previousAdherenceScore,
        change: currentAdherenceScore - previousAdherenceScore,
        trend: this.getTrend(currentAdherenceScore - previousAdherenceScore)
      },
      mindsetScore: {
        current: currentMindsetScore,
        previous: previousMindsetScore,
        change: currentMindsetScore - previousMindsetScore,
        trend: this.getTrend(currentMindsetScore - previousMindsetScore)
      },
      satisfactionScore: {
        current: currentSatisfactionScore,
        previous: previousSatisfactionScore,
        change: currentSatisfactionScore - previousSatisfactionScore,
        trend: this.getTrend(currentSatisfactionScore - previousSatisfactionScore)
      },
      overallScore: {
        current: currentOverallScore,
        previous: previousOverallScore,
        change: currentOverallScore - previousOverallScore,
        trend: this.getTrend(currentOverallScore - previousOverallScore)
      }
    };
  }


  calculateHealthScore(healthData) {
    if (!healthData) return 0;
    
    // Weight change is relative, so we'll focus on other metrics
    const energyScore = (healthData.energyLevel / 10) * 25;
    const sleepScore = (healthData.sleepQuality / 10) * 25;
    const recoveryScore = (healthData.workoutRecoveryRating / 10) * 25;
    
    // Body fat and waist are improvement metrics (lower is better for most)
    // For now, we'll give a base score of 25 for body composition
    const bodyCompositionScore = 25;
    
    return Math.round(energyScore + sleepScore + recoveryScore + bodyCompositionScore);
  }

  calculateAdherenceScore(adherenceData) {
    if (!adherenceData) return 0;
    
    const supplementScore = (adherenceData.didYouTakeSupplimentsAsRecommended / 100) * 20;
    const mealsScore = Math.min((adherenceData.howManyMealsDidYouFollow / 21) * 20, 20); // Assuming 21 meals per week
    const workoutScore = Math.min((adherenceData.workoutDidYouCompleteThisWeek / 7) * 20, 20); // Max 7 workouts
    const hydrationScore = (adherenceData.howConsistentWithHydration / 10) * 20;
    const coachScore = adherenceData.checkInWithCoachThisWeek ? 20 : 0;
    
    return Math.round(supplementScore + mealsScore + workoutScore + hydrationScore + coachScore);
  }
  
  calculateMindsetScore(mindsetData) {
    if (!mindsetData) return 0;
    
    const motivationScore = (mindsetData.howMotivatedDoYouFeel / 10) * 50;
    const confidenceScore = (mindsetData.howConfidentAreYou / 10) * 50;
    
    return Math.round(motivationScore + confidenceScore);
  }
  
  calculateSatisfactionScore(satisfactionData) {
    if (!satisfactionData) return 0;
    
    const progressScore = satisfactionData.areYouHappyWithCurrentProgress ? 25 : 0;
    const supportScore = satisfactionData.doYouFeelSupported ? 25 : 0;
    const recommendScore = satisfactionData.wouldYouRecommendUs ? 50 : 0;
    
    return progressScore + supportScore + recommendScore;
  }
  
  getTrend(change) {
    if (change > 0) return 'up';
    if (change < 0) return 'down';
    return 'neutral';
  }


  // Update existing success tracker
  async updateSuccessTracker(userId, data) {
    try {
      const weekStart = moment().startOf('week').toDate();
      const weekEnd = moment().endOf('week').toDate();
      
      const successTracker = await SuccessTracker.findOne({
        createdBy: userId,
        weekStartDate: { $gte: weekStart, $lte: weekEnd },
        isDeleted: false
      });
      
      if (!successTracker) {
        throw new Error('No success tracker found for current week');
      }
      
      const promises = [];
      
      // Update each category if provided
      if (data.healthAndPerformance) {
        promises.push(
          HealthAndPerformance.findOneAndUpdate(
            { successTracker_id: successTracker._id, isDeleted: false },
            data.healthAndPerformance,
            { new: true, upsert: true }
          )
        );
      }
      
      if (data.mindsetAndMomentum) {
        promises.push(
          MindsetAndMomentum.findOneAndUpdate(
            { successTracker_id: successTracker._id, isDeleted: false },
            data.mindsetAndMomentum,
            { new: true, upsert: true }
          )
        );
      }
      
      if (data.satisfactionAndFeedback) {
        promises.push(
          SatisfactionAndFeedback.findOneAndUpdate(
            { successTracker_id: successTracker._id, isDeleted: false },
            data.satisfactionAndFeedback,
            { new: true, upsert: true }
          )
        );
      }
      
      if (data.adherenceAndConsistency) {
        promises.push(
          AdherenceAndConsistency.findOneAndUpdate(
            { successTracker_id: successTracker._id, isDeleted: false },
            data.adherenceAndConsistency,
            { new: true, upsert: true }
          )
        );
      }
      
      await Promise.all(promises);
      
      return await this.getSuccessTrackerComparison(userId);
      
    } catch (error) {
      throw error;
    }
  }

  // Get historical data (multiple weeks)
  async getHistoricalData(userId, weeks = 4) {
    try {
      const endDate = moment().endOf('week').toDate();
      const startDate = moment().subtract(weeks - 1, 'weeks').startOf('week').toDate();
      
      const trackers = await SuccessTracker.find({
        createdBy: userId,
        weekStartDate: { $gte: startDate, $lte: endDate },
        isDeleted: false
      }).sort({ weekStartDate: -1 });
      
      const historicalData = [];
      
      for (const tracker of trackers) {
        const weekData = await this.getWeekData(tracker._id);
        historicalData.push({
          weekInfo: {
            weekStartDate: tracker.weekStartDate,
            weekEndDate: tracker.weekEndDate
          },
          data: weekData
        });
      }
      
      return historicalData;
      
    } catch (error) {
      throw error;
    }
  }

}
