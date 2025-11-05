//@ts-ignore
import { Request, Response, NextFunction } from 'express';
import sendResponse from '../shared/sendResponse';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';

//---------------------------------
// this middleware will set the req.query.<referenceToUser> = req.params.<referenceToParamsId>  
//---------------------------------
export const getIdFromParamsAndSetInQueryForFilter = <T> (referenceToParamsId: string, referenceToUser: string) => {
  return (req: Request, res:Response, next:NextFunction) => {
    
    // const filtersParam = req.query || ''; // Get filters query param

    if (!req.user) {
      sendResponse(res, {
        code: StatusCodes.UNAUTHORIZED,
        message: 'You are not authorized',
        success: false,
      });
      return;
    }

    req.query[referenceToUser] = req.params[referenceToParamsId]

    // Proceed to the next middleware or controller if validation passes
    next();
  };
};
