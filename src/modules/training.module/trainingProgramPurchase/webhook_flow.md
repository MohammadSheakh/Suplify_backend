/**********************
     * 
     * IN WEBHOOK ... what we have to do .... 
     * 
     * 
     * for every training session .. we have to create
     * patientTrainingSession.. 
     * 
     * also 
     * 
     * // 2. Get sessions of this program
        const sessions = await TrainingSession.find({ training_program_id: programId }).sort("sessionCount");

        // 3. Create PatientTrainingSession with unlock dates
        const patientSessions = sessions.map((session, index) => {
          const unlockDate = new Date(purchaseDate.getTime() + index * 7 * 24 * 60 * 60 * 1000);
          return {
            trainingSessionId: session._id,
            userId,
            status: "incomplete",
            unlockDate,
            isUnlocked: purchaseDate >= unlockDate, // first session unlocked immediately
          };
        });


        await PatientTrainingSession.insertMany(patientSessions);
      * 
      * 
      * 
      * 
      * ***************** */

    /***********
     * 
     * Not Create Related .. Its for viewing all training session .. for patient .. 
     * Real time lock unlock checking .. 
     * 
     * const getUserSessions = async (userId, programId) => {
          const today = new Date();

          const sessions = await PatientTrainingSession.find({
            userId,
          }).populate("trainingSessionId");

          // Update isUnlocked dynamically
          return sessions.map((s) => {
            const unlocked = today >= s.unlockDate;
            return {
              ...s.toObject(),
              isUnlocked: unlocked, // override with real-time check
            };
          });
        };
      * 
      * 
      * 
      * ***** */   