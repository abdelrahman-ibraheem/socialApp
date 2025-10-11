import type { Response } from "express";

export const successHandler = ({ res, msg = "success", data = null }: { res: Response; msg?: string; data?: any }) => {
  return res.status(200).json({
    status: "success",  
    message: msg,
    data: data
  });  
}     