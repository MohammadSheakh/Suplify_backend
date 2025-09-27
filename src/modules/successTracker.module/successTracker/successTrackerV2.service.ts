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

export class SuccessTrackerServiceV2 extends GenericService<
  typeof SuccessTracker,
  ISuccessTracker
> {
  constructor() {
    super(SuccessTracker);
  }

  async getSuccessTrackerOverview(userId) {
    try {
      // Get current week and previous week data
      const currentWeekData = await this.getSuccessTrackerDetails(userId, 0);
      const previousWeekData = await this.getSuccessTrackerDetails(userId, -1);

      // Calculate percentage changes
      const overview = this.calculateOverviewMetrics(currentWeekData, previousWeekData);
      
      return overview;
    } catch (error) {
      throw error;
    }
  }

  async getSuccessTrackerDetails(userId, weekOffset = 0) {
    try {
      // Calculate week start and end based on offset
      const weekStart = moment().add(weekOffset, 'weeks').startOf('week').toDate();
      const weekEnd = moment().add(weekOffset, 'weeks').endOf('week').toDate();

      // Find success tracker for the specified week
      const successTracker = await SuccessTracker.findOne({
        createdBy: userId,
        weekStartDate: { $gte: weekStart, $lte: weekEnd },
        isDeleted: false
      });

      if (!successTracker) {
        return null;
      }

      // Get all related data
      const [healthData, mindsetData, satisfactionData, adherenceData] = await Promise.all([
        HealthAndPerformance.findOne({ successTrackerId: successTracker._id }),
        MindsetAndMomentum.findOne({ successTrackerId: successTracker._id }),
        SatisfactionAndFeedback.findOne({ successTrackerId: successTracker._id }),
        AdherenceAndConsistency.findOne({ successTrackerId: successTracker._id })
      ]);

      return {
        successTracker,
        healthAndPerformance: healthData,
        mindsetAndMomentum: mindsetData,
        satisfactionAndFeedback: satisfactionData,
        adherenceAndConsistency: adherenceData
      };
    } catch (error) {
      throw error;
    }
  }

  calculateOverviewMetrics(currentWeek, previousWeek) {
    const metrics = {
      all: { percentage: 0, score: 0, maxScore: 90 },
      healthAndPerformance: { percentage: 0, score: 0, maxScore: 25 },
      adherenceAndConsistency: { percentage: 0, score: 0, maxScore: 55 },
      mindsetAndMomentum: { percentage: 0, score: 0, maxScore: 25 },
      satisfactionAndFeedback: { percentage: 0, score: 0, maxScore: 10 },
      comparisonData: []
    };

    if (!currentWeek || !previousWeek) {
      // Calculate current week scores even without previous data
      if (currentWeek) {
        metrics.healthAndPerformance.score = this.calculateHealthPerformanceScore(currentWeek.healthAndPerformance);
        metrics.adherenceAndConsistency.score = this.calculateAdherenceScore(currentWeek.adherenceAndConsistency);
        metrics.mindsetAndMomentum.score = this.calculateMindsetScore(currentWeek.mindsetAndMomentum);
        metrics.satisfactionAndFeedback.score = this.calculateSatisfactionScore(currentWeek.satisfactionAndFeedback);
        metrics.all.score = metrics.healthAndPerformance.score + metrics.adherenceAndConsistency.score + 
                           metrics.mindsetAndMomentum.score + metrics.satisfactionAndFeedback.score;
      }
      
      return {
        ...metrics,
        comparisonData: this.getComparisonTableData(currentWeek, previousWeek)
      };
    }

    // Calculate category percentages and scores
    metrics.healthAndPerformance.percentage = this.calculateHealthPerformanceChange(
      currentWeek.healthAndPerformance, 
      previousWeek.healthAndPerformance
    );
    metrics.healthAndPerformance.score = this.calculateHealthPerformanceScore(currentWeek.healthAndPerformance);

    metrics.adherenceAndConsistency.percentage = this.calculateAdherenceChange(
      currentWeek.adherenceAndConsistency, 
      previousWeek.adherenceAndConsistency
    );
    metrics.adherenceAndConsistency.score = this.calculateAdherenceScore(currentWeek.adherenceAndConsistency);

    metrics.mindsetAndMomentum.percentage = this.calculateMindsetChange(
      currentWeek.mindsetAndMomentum, 
      previousWeek.mindsetAndMomentum
    );
    metrics.mindsetAndMomentum.score = this.calculateMindsetScore(currentWeek.mindsetAndMomentum);

    metrics.satisfactionAndFeedback.percentage = this.calculateSatisfactionChange(
      currentWeek.satisfactionAndFeedback, 
      previousWeek.satisfactionAndFeedback
    );
    metrics.satisfactionAndFeedback.score = this.calculateSatisfactionScore(currentWeek.satisfactionAndFeedback);

    // Calculate overall percentage (average of all categories)
    const allPercentages = [
      metrics.healthAndPerformance.percentage,
      metrics.adherenceAndConsistency.percentage,
      metrics.mindsetAndMomentum.percentage,
      metrics.satisfactionAndFeedback.percentage
    ];
    
    metrics.all.percentage = Math.round(
      allPercentages.reduce((sum, val) => sum + val, 0) / allPercentages.length
    );

    // Calculate total score
    metrics.all.score = metrics.healthAndPerformance.score + metrics.adherenceAndConsistency.score + 
                       metrics.mindsetAndMomentum.score + metrics.satisfactionAndFeedback.score;

    // Get detailed comparison data
    metrics.comparisonData = this.getComparisonTableData(currentWeek, previousWeek);

    return metrics;
  }

  calculateHealthPerformanceChange(current, previous) {
    if (!current || !previous) return 0;

    const improvements = [];
    
    // Weight (lower is better for most cases, but we'll consider maintenance as positive)
    if (current.currentWeight && previous.currentWeight) {
      const weightChange = ((previous.currentWeight - current.currentWeight) / previous.currentWeight) * 100;
      improvements.push(Math.min(weightChange, 5)); // Cap at 5% improvement
    }

    // Energy Level (higher is better)
    if (current.energyLevel && previous.energyLevel) {
      improvements.push(((current.energyLevel - previous.energyLevel) / previous.energyLevel) * 100);
    }

    // Sleep Quality (higher is better)
    if (current.sleepQuality && previous.sleepQuality) {
      improvements.push(((current.sleepQuality - previous.sleepQuality) / previous.sleepQuality) * 100);
    }

    // Workout Recovery (higher is better)
    if (current.workoutRecoveryRating && previous.workoutRecoveryRating) {
      improvements.push(((current.workoutRecoveryRating - previous.workoutRecoveryRating) / previous.workoutRecoveryRating) * 100);
    }

    return improvements.length > 0 ? 
      Math.round(improvements.reduce((sum, val) => sum + val, 0) / improvements.length) : 0;
  }

  calculateAdherenceChange(current, previous) {
    if (!current || !previous) return 0;

    const improvements = [];

    // Supplement consistency
    if (current.didYouTakeSupplimentsAsRecommended && previous.didYouTakeSupplimentsAsRecommended) {
      improvements.push(current.didYouTakeSupplimentsAsRecommended - previous.didYouTakeSupplimentsAsRecommended);
    }

    // Meals followed
    if (current.howManyMealsDidYouFollow && previous.howManyMealsDidYouFollow) {
      improvements.push(((current.howManyMealsDidYouFollow - previous.howManyMealsDidYouFollow) / previous.howManyMealsDidYouFollow) * 100);
    }

    // Workouts completed
    if (current.workoutDidYouCompleteThisWeek && previous.workoutDidYouCompleteThisWeek) {
      improvements.push(((current.workoutDidYouCompleteThisWeek - previous.workoutDidYouCompleteThisWeek) / previous.workoutDidYouCompleteThisWeek) * 100);
    }

    // Hydration consistency
    if (current.howConsistentWithHydration && previous.howConsistentWithHydration) {
      improvements.push(((current.howConsistentWithHydration - previous.howConsistentWithHydration) / previous.howConsistentWithHydration) * 100);
    }

    return improvements.length > 0 ? 
      Math.round(improvements.reduce((sum, val) => sum + val, 0) / improvements.length) : 0;
  }

  calculateMindsetChange(current, previous) {
    if (!current || !previous) return 0;

    const improvements = [];

    // Motivation level
    if (current.howMotivatedDoYouFeel && previous.howMotivatedDoYouFeel) {
      improvements.push(((current.howMotivatedDoYouFeel - previous.howMotivatedDoYouFeel) / previous.howMotivatedDoYouFeel) * 100);
    }

    // Confidence level
    if (current.howConfidentAreYou && previous.howConfidentAreYou) {
      improvements.push(((current.howConfidentAreYou - previous.howConfidentAreYou) / previous.howConfidentAreYou) * 100);
    }

    return improvements.length > 0 ? 
      Math.round(improvements.reduce((sum, val) => sum + val, 0) / improvements.length) : 0;
  }

  calculateSatisfactionChange(current, previous) {
    if (!current || !previous) return 0;

    let score = 0;
    let factors = 0;

    // Progress satisfaction (boolean to score)
    if (current.areYouHappyWithCurrentProgress !== undefined && previous.areYouHappyWithCurrentProgress !== undefined) {
      const currentScore = current.areYouHappyWithCurrentProgress ? 10 : 0;
      const previousScore = previous.areYouHappyWithCurrentProgress ? 10 : 0;
      score += (currentScore - previousScore);
      factors++;
    }

    // Support feeling
    if (current.doYouFeelSupported !== undefined && previous.doYouFeelSupported !== undefined) {
      const currentScore = current.doYouFeelSupported ? 10 : 0;
      const previousScore = previous.doYouFeelSupported ? 10 : 0;
      score += (currentScore - previousScore);
      factors++;
    }

    // Recommendation willingness
    if (current.wouldYouRecommendUs !== undefined && previous.wouldYouRecommendUs !== undefined) {
      const currentScore = current.wouldYouRecommendUs ? 10 : 0;
      const previousScore = previous.wouldYouRecommendUs ? 10 : 0;
      score += (currentScore - previousScore);
      factors++;
    }

    return factors > 0 ? Math.round(score / factors) : 0;
  }

  // SCORING CALCULATION METHODS
  calculateHealthPerformanceScore(healthData) {
    if (!healthData) return 0;

    let score = 0;

    // Energy, motivation, and sleep quality: combined total up to 25 points
    // Each metric is out of 10, so total 30, scale to 25
    const energyScore = (healthData.energyLevel || 0) * 2.5; // Max 25 points if 10/10
    const sleepScore = (healthData.sleepQuality || 0) * 2.5; // Max 25 points if 10/10
    const recoveryScore = (healthData.workoutRecoveryRating || 0) * 2.5; // Max 25 points if 10/10

    // Take average of available scores and scale to 25
    const availableScores = [energyScore, sleepScore, recoveryScore].filter(s => s > 0);
    if (availableScores.length > 0) {
      score = Math.round(availableScores.reduce((sum, s) => sum + s, 0) / availableScores.length);
      score = Math.min(score, 25); // Cap at 25
    }

    return score;
  }

  calculateAdherenceScore(adherenceData) {
    if (!adherenceData) return 0;

    let score = 0;

    // Workouts completed: up to 25 points (assuming 5 workouts max per week)
    if (adherenceData.workoutDidYouCompleteThisWeek) {
      score += Math.min(adherenceData.workoutDidYouCompleteThisWeek * 5, 25);
    }

    // Meals followed: up to 20 points (21 meals max per week)
    if (adherenceData.howManyMealsDidYouFollow) {
      score += Math.round((adherenceData.howManyMealsDidYouFollow / 21) * 20);
    }

    // Hydration consistency: up to 10 points (scale from 10-point rating)
    if (adherenceData.howConsistentWithHydration) {
      score += Math.round((adherenceData.howConsistentWithHydration / 10) * 10);
    }

    // Bonus points for consistent check-ins: up to 10 points
    if (adherenceData.checkInWithCoachThisWeek) {
      score += 10;
    }

    // Additional points for supplement consistency (if high percentage)
    if (adherenceData.didYouTakeSupplimentsAsRecommended && 
        adherenceData.didYouTakeSupplimentsAsRecommended >= 90) {
      score += 5; // Bonus for 90%+ consistency
    }

    return Math.min(score, 55); // Cap at 55 points max
  }

  calculateMindsetScore(mindsetData) {
    if (!mindsetData) return 0;

    let score = 0;

    // Motivation level: up to 12.5 points (from 10-point scale)
    if (mindsetData.howMotivatedDoYouFeel) {
      score += Math.round((mindsetData.howMotivatedDoYouFeel / 10) * 12.5);
    }

    // Confidence level: up to 12.5 points (from 10-point scale)
    if (mindsetData.howConfidentAreYou) {
      score += Math.round((mindsetData.howConfidentAreYou / 10) * 12.5);
    }

    return Math.min(score, 25); // Cap at 25 points max
  }

  calculateSatisfactionScore(satisfactionData) {
    if (!satisfactionData) return 0;

    let score = 0;
    let maxPossible = 0;

    // Progress satisfaction: 3.33 points
    if (satisfactionData.areYouHappyWithCurrentProgress !== undefined) {
      score += satisfactionData.areYouHappyWithCurrentProgress ? 3.33 : 0;
      maxPossible += 3.33;
    }

    // Support feeling: 3.33 points  
    if (satisfactionData.doYouFeelSupported !== undefined) {
      score += satisfactionData.doYouFeelSupported ? 3.33 : 0;
      maxPossible += 3.33;
    }

    // Recommendation willingness: 3.34 points
    if (satisfactionData.wouldYouRecommendUs !== undefined) {
      score += satisfactionData.wouldYouRecommendUs ? 3.34 : 0;
      maxPossible += 3.34;
    }

    return Math.round(Math.min(score, 10)); // Cap at 10 points max
  }

  getComparisonTableData(currentWeek, previousWeek) {
    const comparisonData = [
      {
        slNo: 1,
        question: "Weight",
        previousWeek: previousWeek?.healthAndPerformance?.currentWeight || '-',
        lastWeek: currentWeek?.healthAndPerformance?.currentWeight || '-'
      },
      {
        slNo: 2,
        question: "Body Fat Percentage",
        previousWeek: previousWeek?.healthAndPerformance?.bodyFatPercentage ? `${previousWeek.healthAndPerformance.bodyFatPercentage}%` : '-',
        lastWeek: currentWeek?.healthAndPerformance?.bodyFatPercentage ? `${currentWeek.healthAndPerformance.bodyFatPercentage}%` : '-'
      },
      {
        slNo: 3,
        question: "Waist Measurement (in inches)",
        previousWeek: previousWeek?.healthAndPerformance?.waistMeasurement || '-',
        lastWeek: currentWeek?.healthAndPerformance?.waistMeasurement || '-'
      },
      {
        slNo: 4,
        question: "Energy Level (1-10)",
        previousWeek: previousWeek?.healthAndPerformance?.energyLevel || '-',
        lastWeek: currentWeek?.healthAndPerformance?.energyLevel || '-'
      },
      {
        slNo: 5,
        question: "Sleep Quality (Past 7 Days)",
        previousWeek: previousWeek?.healthAndPerformance?.sleepQuality || '-',
        lastWeek: currentWeek?.healthAndPerformance?.sleepQuality || '-'
      },
      {
        slNo: 6,
        question: "Workout Recovery Rating",
        previousWeek: previousWeek?.healthAndPerformance?.workoutRecoveryRating || '-',
        lastWeek: currentWeek?.healthAndPerformance?.workoutRecoveryRating || '-'
      },
      {
        slNo: 7,
        question: "Supplement Intake Consistency",
        previousWeek: previousWeek?.adherenceAndConsistency?.didYouTakeSupplimentsAsRecommended ? `${previousWeek.adherenceAndConsistency.didYouTakeSupplimentsAsRecommended}%` : '-',
        lastWeek: currentWeek?.adherenceAndConsistency?.didYouTakeSupplimentsAsRecommended ? `${currentWeek.adherenceAndConsistency.didYouTakeSupplimentsAsRecommended}%` : '-'
      },
      {
        slNo: 8,
        question: "Meals Followed from Nutrition Plan",
        previousWeek: previousWeek?.adherenceAndConsistency?.howManyMealsDidYouFollow ? `${previousWeek.adherenceAndConsistency.howManyMealsDidYouFollow}/21` : '-',
        lastWeek: currentWeek?.adherenceAndConsistency?.howManyMealsDidYouFollow ? `${currentWeek.adherenceAndConsistency.howManyMealsDidYouFollow}/21` : '-'
      },
      {
        slNo: 9,
        question: "Workouts Completed This Week",
        previousWeek: previousWeek?.adherenceAndConsistency?.workoutDidYouCompleteThisWeek || '-',
        lastWeek: currentWeek?.adherenceAndConsistency?.workoutDidYouCompleteThisWeek || '-'
      },
      {
        slNo: 10,
        question: "Hydration Consistency",
        previousWeek: previousWeek?.adherenceAndConsistency?.howConsistentWithHydration || '-',
        lastWeek: currentWeek?.adherenceAndConsistency?.howConsistentWithHydration || '-'
      },
      {
        slNo: 11,
        question: "Coach or Plan Check-in Status",
        previousWeek: previousWeek?.adherenceAndConsistency?.checkInWithCoachThisWeek ? 'Yes' : 'No',
        lastWeek: currentWeek?.adherenceAndConsistency?.checkInWithCoachThisWeek ? 'Yes' : 'No'
      },
      {
        slNo: 12,
        question: "Motivation Level for Upcoming Week",
        previousWeek: previousWeek?.mindsetAndMomentum?.howMotivatedDoYouFeel || '-',
        lastWeek: currentWeek?.mindsetAndMomentum?.howMotivatedDoYouFeel || '-'
      },
      {
        slNo: 13,
        question: "Win Highlight",
        previousWeek: previousWeek?.mindsetAndMomentum?.oneWinFromPastWeekThatYourProudOf || '-',
        lastWeek: currentWeek?.mindsetAndMomentum?.oneWinFromPastWeekThatYourProudOf || '-'
      },
      {
        slNo: 14,
        question: "Biggest Weekly Challenge",
        previousWeek: previousWeek?.mindsetAndMomentum?.biggestChallengeofThisWeek || '-',
        lastWeek: currentWeek?.mindsetAndMomentum?.biggestChallengeofThisWeek || '-'
      },
      {
        slNo: 15,
        question: "Improved or Built Habit",
        previousWeek: previousWeek?.mindsetAndMomentum?.oneHabitYouImprovedOrBuiltThisWeek || '-',
        lastWeek: currentWeek?.mindsetAndMomentum?.oneHabitYouImprovedOrBuiltThisWeek || '-'
      },
      {
        slNo: 16,
        question: "Confidence in Staying on Track",
        previousWeek: previousWeek?.mindsetAndMomentum?.howConfidentAreYou || '-',
        lastWeek: currentWeek?.mindsetAndMomentum?.howConfidentAreYou || '-'
      },
      {
        slNo: 17,
        question: "Satisfaction with Current Progress",
        previousWeek: previousWeek?.satisfactionAndFeedback?.areYouHappyWithCurrentProgress ? 'Yes' : 'No',
        lastWeek: currentWeek?.satisfactionAndFeedback?.areYouHappyWithCurrentProgress ? 'Yes' : 'No'
      },
      {
        slNo: 18,
        question: "Feeling of Support from Coach/System",
        previousWeek: previousWeek?.satisfactionAndFeedback?.doYouFeelSupported ? 'Yes' : 'No',
        lastWeek: currentWeek?.satisfactionAndFeedback?.doYouFeelSupported ? 'Yes' : 'No'
      },
      {
        slNo: 19,
        question: "Area Needing Help or Adjustment",
        previousWeek: previousWeek?.satisfactionAndFeedback?.oneThingYouNeedHelpWith || '-',
        lastWeek: currentWeek?.satisfactionAndFeedback?.oneThingYouNeedHelpWith || '-'
      },
      {
        slNo: 20,
        question: "Willingness to Recommend Suplify",
        previousWeek: previousWeek?.satisfactionAndFeedback?.wouldYouRecommendUs ? 'Yes' : 'No',
        lastWeek: currentWeek?.satisfactionAndFeedback?.wouldYouRecommendUs ? 'Yes' : 'No'
      }
    ];

    return comparisonData;
  }



}
