//@ts-ignore
import { Response } from 'express';

type IData<T> = {
  code: number;
  message?: string;
  data?: T;
  data2?: any;
  success?: boolean;
};

const sendResponse = <T>(res: Response, data: IData<T>) => {
  const resData = {
    code: data.code,
    message: data.message,
    data: {
      attributes: data.data,
      additionalResponse: data.data2
    },
    success: data.success,
  };
  res.status(data.code).json(resData);
};

export default sendResponse;
