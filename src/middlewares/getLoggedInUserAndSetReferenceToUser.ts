//@ts-ignore
import { Request, Response, NextFunction } from 'express';

/**********
 * 
 * this middleware will set the req.query.<referenceToUser> = req.user.userId ||||
 * so that we can use it in the router to filter the data based on logged in user 
 * 
 * ******** */
export const getLoggedInUserAndSetReferenceToUser = <T> (referenceToUser: string) => {
  return (req: Request, res:Response, next:NextFunction) => {
    
    // const filtersParam = req.query || ''; // Get filters query param

    req.query[referenceToUser]  = (req.user as any).userId;

    // Proceed to the next middleware or controller if validation passes
    next();
  };
};
