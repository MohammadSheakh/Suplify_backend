import OpenAI from 'openai';
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

/******************
const model = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, //OPENAI_API_KEY // OPENROUTER_API_KEY
  baseURL: 'https://openrouter.ai/api/v1',
  //baseURL: 'https://api.openai.com/v1'
});


interface OpenAIEmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}  

const openAiHeaders = {
  "Content-Type": "application/json",
  'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
}



 * ************
 * before saving .. create embedding for user messsage .. 
 * ***********


const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
  method: 'POST',
  headers: openAiHeaders,
  body: JSON.stringify({
    model: "text-embedding-3-small", // // Updated model (ada-002 is deprecated)
    input: User
  })
});

if (!embeddingResponse.ok) {
  throw new ApiError(
    StatusCodes.INTERNAL_SERVER_ERROR,
    `Failed to create embedding: ${embeddingResponse.statusText}`
  );
}

const embeddingData: OpenAIEmbeddingResponse = await embeddingResponse.json();
const embedding = embeddingData.data[0].embedding;


let systemPrompt = await ChatBotService.dateParse(userMessage, userId);

// Convert previous messages to the format expected by the API
const formattedMessages = [
  { role: 'system', content: systemPrompt }
];

formattedMessages.push(
  {
    role: 'user',
    content: userMessage.toString(),
  }
)
   

while (retries <= maxRetries) {
try {
  stream = await model.chat.completions.create({
    model: 'gpt-4o', // GPT-4o // qwen/qwen3-30b-a3b:free <- is give wrong result   // gpt-3.5-turbo <- give perfect result
    messages: formattedMessages,
    
      // [
      //   { role: 'system', content: systemPrompt },
      //   { role: 'user', content: userMessage },
      // ],
    
    temperature: 0.7,
    stream: true,
  });

  // If we get here, the request was successful
  break;
} catch (error) {
  console.log("🌋🌋🌋🌋🌋");
  // Check if it's a rate limit error (429)
  if (error.status === 429) {
    if (
      error.message &&
      (error.message.includes('quota') ||
        error.message.includes('billing'))
    ) {
      // This is a quota/billing issue - try fallback if we haven't already
      if (retries === 0) {
        console.log('Quota or billing issue. Trying fallback model...');
        try {
          // Try a different model as fallback
          stream = await model.chat.completions.create({
            model: 'gpt-3.5-turbo', // Using the same model as a placeholder, replace with actual fallback
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
            stream: true,
          });
          break; // If fallback succeeds, exit the retry loop
        } catch (fallbackError) {
          console.error('Fallback model failed:', fallbackError);
          // Continue with retries
        }
      } else {
        console.log(
          'Quota or billing issue. No more fallbacks available.'
        );
        throw error; // Give up after fallback attempts
      }
    }

    // Regular rate limit - apply exponential backoff
    retries++;
    if (retries > maxRetries) {
      // Send error message to client before throwing
      res.write(
        `data: ${JSON.stringify({
          error: 'Rate limit exceeded. Please try again later.',
        })}\n\n`
      );
      res.end();
      throw error; // Give up after max retries
    }

    console.log(
      `Rate limited. Retrying in ${delay}ms... (Attempt ${retries}/${maxRetries})`
    );
    await new Promise(resolve => setTimeout(resolve, delay));

    // Exponential backoff with jitter
    delay = delay * 2 * (0.5 + Math.random()); // Multiply by random factor between 1 and 1.5
  } else {
    // Not a rate limit error
    console.error('OpenAI API error:', error);
    res.write(
      `data: ${JSON.stringify({
        error: 'An error occurred while processing your request.',
      })}\n\n`
    );
    res.end();
    return; // Exit the function
  }
}
}

if (!stream) {
  res.write(
    `data: ${JSON.stringify({
      error: 'Failed to generate a response. Please try again.',
    })}\n\n`
  );
  res.end();
  return;
}

// Process each chunk as it arrives
    try {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          responseText += content;

          // Send the chunk to the client
          res.write(`data: ${JSON.stringify({ chunk: content })}\n\n`);

          // Flush the data to ensure it's sent immediately
          if (res.flush) {
            res.flush();
          }
        }
      }

      // Send end of stream marker
      res.write(`data: ${JSON.stringify({ done: true, fullResponse: responseText })}\n\n`);


      

      res.end(); // 🟢🟢🟢 end korte hobe
    } catch (streamError) {
      console.error('Error processing stream:', streamError);
      res.write(
        `data: ${JSON.stringify({
          error: 'Stream processing error. Please try again.',
        })}\n\n`
      );
      res.end();
    }
 
************ */

export class SuccessTrackerServiceV4 extends GenericService<
  typeof SuccessTracker,
  ISuccessTracker
> {
  constructor() {
    super(SuccessTracker);
  }

  // 🟢🟢 
  async getAllSuccessTrackerData(userId) {
    try {
      // Get all success trackers for user, sorted by week (oldest first)
      const trackers = await SuccessTracker.find({
        createdBy: userId,
        isDeleted: false
      })
      .sort({ weekStartDate: 1 })
      .lean();

      if (!trackers.length) return [];

      // Fetch all related data in bulk
      const trackerIds = trackers.map(t => t._id);

      const [healthList, mindsetList, satisfactionList, adherenceList] = await Promise.all([
        HealthAndPerformance.find({ successTrackerId: { $in: trackerIds } }).lean(),
        MindsetAndMomentum.find({ successTrackerId: { $in: trackerIds } }).lean(),
        SatisfactionAndFeedback.find({ successTrackerId: { $in: trackerIds } }).lean(),
        AdherenceAndConsistency.find({ successTrackerId: { $in: trackerIds } }).lean()
      ]);

      // Create maps for quick lookup
      const healthMap = new Map(healthList.map(h => [h.successTrackerId.toString(), h]));
      const mindsetMap = new Map(mindsetList.map(m => [m.successTrackerId.toString(), m]));
      const satisfactionMap = new Map(satisfactionList.map(s => [s.successTrackerId.toString(), s]));
      const adherenceMap = new Map(adherenceList.map(a => [a.successTrackerId.toString(), a]));

      return trackers.map(tracker => ({
        successTracker: tracker,
        healthAndPerformance: healthMap.get(tracker._id.toString()) || null,
        mindsetAndMomentum: mindsetMap.get(tracker._id.toString()) || null,
        satisfactionAndFeedback: satisfactionMap.get(tracker._id.toString()) || null,
        adherenceAndConsistency: adherenceMap.get(tracker._id.toString()) || null
      }));
    } catch (error) {
      throw error;
    }
  }


 //🟢🟢 
  async getSuccessTrackerOverview(userId) {
    try {
      const allWeeksData = await this.getAllSuccessTrackerData(userId);
      
      if (!allWeeksData.length) {
        return this.getEmptyOverview();
      }

      // Current week = last entry
      const currentWeek = allWeeksData[allWeeksData.length - 1];
      
      // Previous week = second last (if exists)
      const previousWeek = allWeeksData.length > 1 
        ? allWeeksData[allWeeksData.length - 2] 
        : null;

      // All historical weeks (excluding current)
      const historicalWeeks = allWeeksData.slice(0, -1);

      const overview = this.calculateOverviewMetrics(currentWeek, previousWeek, historicalWeeks);
      
      return overview;
    } catch (error) {
      throw error;
    }
  }

  getEmptyOverview() {
    return {
      all: { percentage: 0, score: 0, maxScore: 115 },
      healthAndPerformance: { percentage: 0, score: 0, maxScore: 25 },
      adherenceAndConsistency: { percentage: 0, score: 0, maxScore: 55 },
      mindsetAndMomentum: { percentage: 0, score: 0, maxScore: 25 },
      satisfactionAndFeedback: { percentage: 0, score: 0, maxScore: 10 },
      comparisonData: []
    };
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

  // 🟢 qwen updated
  calculateOverviewMetrics(currentWeek, previousWeek, historicalWeeks = []) {
    const metrics = {
      all: { percentage: 0, score: 0, maxScore: 115 },
      healthAndPerformance: { percentage: 0, score: 0, maxScore: 25 },
      adherenceAndConsistency: { percentage: 0, score: 0, maxScore: 55 },
      mindsetAndMomentum: { percentage: 0, score: 0, maxScore: 25 },
      satisfactionAndFeedback: { percentage: 0, score: 0, maxScore: 10 },
      comparisonData: []
    };

    // Always calculate current week score
    if (currentWeek) {
      metrics.healthAndPerformance.score = this.calculateHealthPerformanceScore(currentWeek.healthAndPerformance);
      metrics.adherenceAndConsistency.score = this.calculateAdherenceScore(currentWeek.adherenceAndConsistency);
      metrics.mindsetAndMomentum.score = this.calculateMindsetScore(currentWeek.mindsetAndMomentum);
      metrics.satisfactionAndFeedback.score = this.calculateSatisfactionScore(currentWeek.satisfactionAndFeedback);
      metrics.all.score = metrics.healthAndPerformance.score + 
                          metrics.adherenceAndConsistency.score + 
                          metrics.mindsetAndMomentum.score + 
                          metrics.satisfactionAndFeedback.score;
    }

    // Calculate percentage change vs. historical average (not just last week)
    const historicalScores = {
      health: [],
      adherence: [],
      mindset: [],
      satisfaction: []
    };

    for (const week of historicalWeeks) {
      if (week.healthAndPerformance) {
        historicalScores.health.push(this.calculateHealthPerformanceScore(week.healthAndPerformance));
      }
      if (week.adherenceAndConsistency) {
        historicalScores.adherence.push(this.calculateAdherenceScore(week.adherenceAndConsistency));
      }
      if (week.mindsetAndMomentum) {
        historicalScores.mindset.push(this.calculateMindsetScore(week.mindsetAndMomentum));
      }
      if (week.satisfactionAndFeedback) {
        historicalScores.satisfaction.push(this.calculateSatisfactionScore(week.satisfactionAndFeedback));
      }
    }

    // Helper to calculate % change vs average
    const calcChangeVsAvg = (currentScore, historicalScores) => {
      if (historicalScores.length === 0 || currentScore === 0) return 0;
      const avg = historicalScores.reduce((a, b) => a + b, 0) / historicalScores.length;
      if (avg === 0) return 0;
      return Math.round(((currentScore - avg) / avg) * 100);
    };

    // Set percentage changes vs historical average
    metrics.healthAndPerformance.percentage = calcChangeVsAvg(
      metrics.healthAndPerformance.score,
      historicalScores.health
    );

    metrics.adherenceAndConsistency.percentage = calcChangeVsAvg(
      metrics.adherenceAndConsistency.score,
      historicalScores.adherence
    );

    metrics.mindsetAndMomentum.percentage = calcChangeVsAvg(
      metrics.mindsetAndMomentum.score,
      historicalScores.mindset
    );

    metrics.satisfactionAndFeedback.percentage = calcChangeVsAvg(
      metrics.satisfactionAndFeedback.score,
      historicalScores.satisfaction
    );

    // Overall percentage = average of category % changes
    const allPercentages = [
      metrics.healthAndPerformance.percentage,
      metrics.adherenceAndConsistency.percentage,
      metrics.mindsetAndMomentum.percentage,
      metrics.satisfactionAndFeedback.percentage
    ].filter(p => !isNaN(p));

    metrics.all.percentage = allPercentages.length > 0
      ? Math.round(allPercentages.reduce((sum, p) => sum + p, 0) / allPercentages.length)
      : 0;

    // Keep comparison table as current vs previous week (for UI)
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

  // Your existing createSuccessTracker method
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
      
      return await this.getSuccessTrackerOverview(userId);
    } catch (error) {
      throw error;
    }
  }
}

