import { StatusCodes } from 'http-status-codes';
import { TrainingSession } from './trainingSession.model';
import { ITrainingSession } from './trainingSession.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { TrainingProgramPurchase } from '../trainingProgramPurchase/trainingProgramPurchase.model';
import { PatientTrainingSession } from '../patientTrainingSession/patientTrainingSession.model';
import { ITrainingProgramPurchase } from '../trainingProgramPurchase/trainingProgramPurchase.interface';
//@ts-ignore
import EventEmitter from 'events';
import { errorLogger } from '../../../shared/logger';

const eventEmitForCreatePatientTrainingSessionForWhoPurchased = new EventEmitter(); 

interface ICreatePatientTrainingSessionForWhoPurchasedEventData {
  trainingProgramId: string;
  createdTrainingSession: ITrainingSession;
}

eventEmitForCreatePatientTrainingSessionForWhoPurchased.on(
  'eventEmitForCreatePatientTrainingSessionForWhoPurchased', async (data: ICreatePatientTrainingSessionForWhoPurchasedEventData) => {
  console.log("eventEmitForCreatePatientTrainingSessionForWhoPurchased event received for trainingProgramId ::", data )
  try {
    const patientWhoPurchasedThisProgram = await TrainingProgramPurchase.find({
      id: data.trainingProgramId
    })

    patientWhoPurchasedThisProgram.forEach( async (purchase : ITrainingProgramPurchase) => {
      // create patientTrainingSession for each purchase
      await PatientTrainingSession.create({
        patientId: purchase.patientId,
        trainingProgramId: data.trainingProgramId,
        trainingSessionId: data.createdTrainingSession._id,
        unlockDate: new Date( 
          purchase.createdAt.getTime() + 
          (data.createdTrainingSession.sessionCount - 1) * 7 * 24 * 60 * 60 * 1000
        ),
        isUnlocked: false, //  we will compute this in frontend // TODO : need to think about this 
      });
    });
  }catch (error) {
    errorLogger.error("Error occurred 🌋 while updating user profile's howManyPrograms count :: ", error);
    console.error("Error occurred 🌋 while updating user profile's howManyPrograms count :: ", error);
  }
});

export default eventEmitForCreatePatientTrainingSessionForWhoPurchased;


export class TrainingSessionService extends GenericService<
  typeof TrainingSession,
  ITrainingSession
> {
  constructor() {
    super(TrainingSession);
  }

  async create(data: ITrainingSession): Promise<ITrainingSession> {
    
    /*****
     * lets calculate this session count
     * *** */
    let sessionCount = await TrainingSession.countDocuments({
      trainingProgramId: data.trainingProgramId,
    });

    data.sessionCount = ++ sessionCount;

    const createdTrainingSession =  await this.model.create(data); 

    /********
     * 📝
     * Lets say .. a patient purchase a training program..
     * after that .. specialist add new session to that program ..
     * then  for training program .. for every trainingProgramPurchase ...
     * 
     * we have to create patientTrainingSession 
     * ---------------
     * compute unlockDate dynamically
     * 
     *  unlockDate = new Date(purchaseDate.getTime() + (session.sessionCount - 1) * 7 * 24 * 60 * 60 * 1000);
        isUnlocked = today >= unlockDate;
     * 
     * ************** */

    //📈⚙️ lets do above work via event emitter for scalability
    eventEmitForCreatePatientTrainingSessionForWhoPurchased.emit(
      'eventEmitForCreatePatientTrainingSessionForWhoPurchased'
      , {trainingProgramId: data.trainingProgramId , createdTrainingSession} );

    return createdTrainingSession;
  }
}
