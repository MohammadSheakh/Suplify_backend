//@ts-ignore
import { Request, Response, NextFunction } from 'express';

// validationMiddleware.js or a separate file for validation middleware
export const getLoggedInUserAndSetReferenceToUser = <T> (referenceToUser: string) => {
  return (req: Request, res:Response, next:NextFunction) => {
    
    // const filtersParam = req.query || ''; // Get filters query param

    req.query[referenceToUser]  = (req.user as any).userId;

    // Proceed to the next middleware or controller if validation passes
    next();
  };
};
