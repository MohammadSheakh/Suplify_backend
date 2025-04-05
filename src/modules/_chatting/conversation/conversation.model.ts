import { model, Schema } from 'mongoose';
import paginate from '../../../common/plugins/paginate';
import { IVirtualWorkoutClass, IVirtualWorkoutClassModel } from './conversation.interface';

const virtualWorkoutClassSchema = new Schema<IVirtualWorkoutClass>(
  {
    title: {
      type: String,
      required: [true, 'title is required'],
    },
    description: {
      type: String,
      required: [true, 'description is required'],
    },
    duration: {
      type: String,
      required: [true, 'duration is required'],
    },
    specialistId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User Id is required'],
    },
    maxEnrollmentCapacity: {
      type : Number,
      required : [true, 'description is needed']
    },
    currentEnrollmentsCount: {
      type : Number,
      required : [false, 'currentEnrollmentCount is not needed'],
      min : 0,
      default : 0
    },
    price : {
      type : Number,
      required : [true, 'price is needed']
    },
    difficultyLevel : {
      type : String,
      required : [true, 'difficultyLevel is needed']
    },
    category : {
      // 🔥 eta te modification hote pare ..  
      type : String,
      required : [true, 'category is needed']
    },
    
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

virtualWorkoutClassSchema.plugin(paginate);

virtualWorkoutClassSchema.pre('save', function(next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee
  
  next();
});


// Use transform to rename _id to _projectId
virtualWorkoutClassSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._virtualWorkoutClassId = ret._id;  // Rename _id to _subscriptionId
    delete ret._id;  // Remove the original _id field
    return ret;
  }
});


export const VirtualWorkoutClass = model<IVirtualWorkoutClass, IVirtualWorkoutClassModel>(
  'VirtualWorkoutClass',
  virtualWorkoutClassSchema
);
