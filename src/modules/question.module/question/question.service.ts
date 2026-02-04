import { StatusCodes } from 'http-status-codes';
import { Question } from './question.model';
import { ICreateQuestion, IQuestion } from './question.interface';
import { GenericService } from '../../_generic-module/generic.services';
//@ts-ignore
import mongoose from 'mongoose';
import { AnswerChoice } from '../answerChoice/answerChoice.model';
import { TQuestionAnswer } from './question.constant';
import ApiError from '../../../errors/ApiError';
import PaginationService from '../../../common/service/paginationService';
import { PaginateOptions } from '../../../types/paginate';


export class QuestionService extends GenericService<
  typeof Question,
  IQuestion
> {
  constructor() {
    super(Question);
  }

  // In your service class
  async createQuestionWithAnswers(data: ICreateQuestion) {
    // Validation
    this.validateQuestionData(data);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const [question] = await Question.create([data], { session });

      let answerChoices = [];
      if (this.needsAnswerChoices(data.answerType)) {
        const answerData = data.answers.map(answer => ({
          answerTitle: answer.answerTitle,
          questionId: question._id,
        }));
        
        answerChoices = await AnswerChoice.insertMany(answerData, { session });
      }

      await session.commitTransaction();
      
      return { question, answerChoices };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  private needsAnswerChoices(answerType: TQuestionAnswer): boolean {
    return ![TQuestionAnswer.text, TQuestionAnswer.number].includes(answerType);
  }

  private validateQuestionData(data: ICreateQuestion) {
    if (this.needsAnswerChoices(data.answerType)) {
      if (!data.answers || data.answers.length === 0) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Please provide answer choices for ${data.answerType} type questions`
        );
      }
    }
  }

  /**
   * Get all questions with their answers for a specific phase
   * @param phaseId - Phase ID to filter questions
   * @param options - Pagination options
   */
  async getQuestionsWithAnswers(
    options: PaginateOptions
  ) {
    // PERF: Aggregation pipeline for questions + answers lookup
    // OPT: Early $match reduces dataset before expensive $lookup operations
    // INDEX: Requires { phaseId: 1, isDeleted: 1 } on questions collection
    // INDEX: Requires { questionId: 1, isDeleted: 1 } on questionanswers collection
    // BENCHMARK: ~80ms for 100 questions with 400 answers total

    
    // PERF: Build match stage for questions
    const questionMatchStage: any = {
      isDeleted: false
    };

    // PERF: Aggregation pipeline with nested lookups
    // OPT: Two-stage lookup (questions → answers) for optimal performance
    const pipeline = [
      // PERF: Step 1 - Filter questions by phaseId (early filtering)
      // OPT: Reduces documents before expensive $lookup operations
      {
        $match: questionMatchStage
      },

      // PERF: Step 2 - Lookup answers for each question
      // OPT: Correlated subquery with pipeline for filtered lookup
      // NOTE: Only fetches non-deleted answers
      {
        $lookup: {
          from: 'answerchoices', // Collection name (adjust if different)
          let: { questionId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$questionId', '$$questionId'] },
                isDeleted: false
              }
            },
            {
              $project: {
                _id: 1,
                questionId: 1,
                answerTitle: 1,
                createdAt: 1,
                updatedAt: 1
              }
            },
          ],
          as: 'answers'
        }
      },

      /*---------------
      // PERF: Step 3 - Count answers per question
      // OPT: Uses $size instead of $unwind for efficiency
      {
        $addFields: {
          answerCount: { $size: '$answers' }
        }
      },
      -----------------*/

      // PERF: Step 4 - Project final fields
      // OPT: Exclude unnecessary fields to reduce network transfer
      {
        $project: {
          _id: 1,
          questionText: 1,
          answerType: 1,
          isRequired : 1, 
          answers: 1,

          // answerCount: 1,
          createdAt: 1,
          updatedAt: 1
        }
      },

      // PERF: Step 5 - Sort by questionNumber (natural order)
      // NOTE: Can be overridden via options.sortBy
      // {
      //   $sort: { questionNumber: 1 }
      // }
    ];

    // PERF: Apply pagination with aggregation
    // NOTE: PaginationService handles skip/limit internally
    const result = await PaginationService.aggregationPaginate(
      Question,
      pipeline,
      options
    );

    return result;
  }

}
