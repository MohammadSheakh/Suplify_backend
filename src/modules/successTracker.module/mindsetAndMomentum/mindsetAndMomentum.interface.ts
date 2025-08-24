import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';


export interface IMindsetAndMomentum {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |

  howMotivatedDoYouFeel: Number;
  oneWinFromPastWeekThatYourProudOf : String;
  biggestChallengeofThisWeek : String;
  oneHabitYouImprovedOrBuiltThisWeek : String;
  howConfidentAreYou : Number;

  isDeleted? : Boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMindsetAndMomentumModel extends Model<IMindsetAndMomentum> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IMindsetAndMomentum>>;
}