Markdown Table Prettifier ---- Ctrl K Ctrl F
Issue 🔥  /  Solved ☑️ / Extra Note 📝
|🔥      | |  |  |  | /9/ | |


| Status | Module             | Feature              | Issue                                               | Description | Date    | Remarks  |
|--------|--------------------|----------------------|-----------------------------------------------------|-------------|---------|----------|
| ☑️     | Auth               | Registration         | not provide any response(specialist works fine btw) |             | 26/8/25 |          |
| ☑️🔥   | Auth               | Registration         | password is not hashed in database .. still issue   |             | 26/8/   |          |
| 🔥     | Socket             | Conversation         | If A user send a message .. his                     |             | /8/     | based on |
| 📝     |                    |                      | conversation list should be updated                 |             | /8/     | sikring  |
| 🔥     | Conversation       |                      | isOnline: global.socketUtils.isUserOnline(userId)   |             | /8/     |          |
| 📝     |                    |                      | give me error                                       |             | /8/     |          |
| 🔥     | Information Video  |                      | must implementget caching information all video     |             | 7/9/    |          |
| 🔥     | Appointment        |                      | Doctor appointment must contain start and end time  |             | 7/9/    |          |
| 🔥     | Specialist Patient | get All Other        | Aproval Status pending can not be shown             |             | /9/     |          |
| 📝     |                    | Specialist           |                                                     |             | 13/9/   |          |
| 🔥     |                    |                      | user.subscriptionPlan can not store                 |             | /9/     |          |
| 📝     |                    |                      | subscriptionPlan in AccessToken ..                  |             | 14/9/   |          |
| 🔥     | /products/id       |                      | Cannot read properties of null (reading 'category') |             | 14/9/   |          |
| 🔥     | TrainingSession    | getAllWithPagination | totalSessionCount calculation has serious issue ..  | may be      | 20/9/   | no need  |
| 🔥     | TrainingProgram    |                      | Total Purchase count need to track                  |             | /8/     | MUST     |
| 🔥     | Specialist Patient |                      | Create multiple relation .. but it                  |             | 21/9/     |          |
| 📝     |                    |                      | should create only one relation                     |             | /8/     |          |


dependencies: ------ remove these dependencies
+ @types/ioredis 5.0.0
+ ioredis 5.8.0
 

