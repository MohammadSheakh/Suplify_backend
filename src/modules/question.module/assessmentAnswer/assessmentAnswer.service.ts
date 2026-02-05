import { StatusCodes } from 'http-status-codes';
import { AssessmentAnswer } from './assessmentAnswer.model';
import { IAssessmentAnswer } from './assessmentAnswer.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { TQuestionAnswer } from '../question/question.constant';
import ApiError from '../../../errors/ApiError';
import { Question } from '../question/question.model';
//@ts-ignore
import mongoose from 'mongoose';
import { User } from '../../user/user.model';


export class AssessmentAnswerService extends GenericService<
  typeof AssessmentAnswer,
  IAssessmentAnswer
> {
  constructor() {
    super(AssessmentAnswer);
  }

  async submitAnswers(
    // assessmentId: string,
    userId: string,
    answers: IAnswerSubmission[]
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

      console.log("userId :: ", userId);

      //-- Check form is already submitted or not 
      const isFormSubmitted = await User.exists(
        { _id: userId, isFormSubmitted: true },
        { session }
      );
      console.log("isFormSubmitted", isFormSubmitted);

      if(isFormSubmitted){
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Form has already been submitted'
        );
      }

      /*------------------
      // 1. Verify assessment belongs to user
      const assessment = await AssessmentAnswer.findOne({
        _id: assessmentId,
        userId: userId,
        isDeleted: false,
      }).session(session);

      if (!assessment) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          'Assessment not found or access denied'
        );
      }

      if (assessment.isCompleted) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Assessment is already completed'
        );
      }

      ------------------*/

      // 2. Get all questions to validate
      const questionIds = answers.map(a => a.questionId);
      const questions = await Question.find({
        _id: { $in: questionIds },
        isDeleted: false,
      }).session(session);

      // if (questions.length !== questionIds.length) {
      //   throw new ApiError(
      //     StatusCodes.BAD_REQUEST,
      //     'Some questions not found'
      //   );
      // }

      // 3. Validate each answer against question type
      const validatedAnswers = answers.map(answer => {
        const question = questions.find(
          q => q._id.toString() === answer.questionId
        );

        if (!question) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            `Question ${answer.questionId} not found`
          );
        }

        // Validate answer format based on question type
        this.validateAnswerValue(answer.answerValue, question.answerType);

        return {
          // assessmentId,
          questionId: answer.questionId,
          answerValue: answer.answerValue,
          answerType : question.answerType
        };
      });

      /*--------------------
      // 4. Upsert answers (update if exists, insert if new)
      const bulkOps = validatedAnswers.map(answer => ({
        updateOne: {
          filter: {
            // assessmentId: answer.assessmentId,
            questionId: answer.questionId,
            userId: userId,
          },
          update: {
            $set: {
              questionId : answer.questionId,
              answerValue: answer.answerValue,
              answerType : answer.answerType,
              updatedAt: new Date(),
              userId : answer.userId,
            },
          },
          upsert: true,
        },
      }));
      ----------------------*/

      const bulkOps = validatedAnswers.map(answer => ({
        updateOne: {
          filter: {
            questionId: answer.questionId,
            userId: userId,
          },
          update: {
            $set: {
              answerValue: answer.answerValue,
              answerType: answer.answerType,
              updatedAt: new Date(),
            },
            $setOnInsert: {
              questionId: answer.questionId,
              userId: userId,
              createdAt: new Date(),
            },
          },
          upsert: true,
        },
      }));

      await AssessmentAnswer.bulkWrite(bulkOps, { session });

      // 5. Optionally mark assessment as completed
      // assessment.isCompleted = true;
      // assessment.completedAt = new Date();
      // await assessment.save({ session });

      //------- Update user's isFormSubmitted to true
      await User.updateOne(
        { _id : userId},
        { $set: { isFormSubmitted : true }},
        { session }
      );

      await session.commitTransaction();

      return {
        // assessmentId,
        answersSubmitted: validatedAnswers.length,
      };

    } catch (error) {

      console.log("error", error)

      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Validation helper
  private validateAnswerValue(value: any, questionType: string) {
    switch (questionType) {
      case TQuestionAnswer.text:
        if (typeof value !== 'string') {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            'Text answer must be a string'
          );
        }
        break;

      case TQuestionAnswer.number:
      case TQuestionAnswer.scale:
        if (typeof value !== 'number') {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            `${questionType} answer must be a number`
          );
        }
        break;

      case TQuestionAnswer.single:
        if (typeof value !== 'string') {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            'Single choice answer must be a string'
          );
        }
        break;

      case TQuestionAnswer.multi:
        if (!Array.isArray(value)) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            'Multiple choice answer must be an array'
          );
        }
        if (value.length === 0) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            'Multiple choice answer cannot be empty'
          );
        }
        break;

      default:
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Invalid question type: ${questionType}`
        );
    }
  }
}
