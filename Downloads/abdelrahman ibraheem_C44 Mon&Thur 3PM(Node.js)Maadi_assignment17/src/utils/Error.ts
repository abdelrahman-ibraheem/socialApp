import { int } from "../../node_modules/zod/index.cjs";

export class ApplicationException extends Error {
  cause: number;
  constructor(message: string, cause: number) {
    super(message);
    this.cause = cause;
  }
}

export interface IError extends Error {
    stautesCode: number;
}
export class validationError extends ApplicationException {
  constructor() {
    super("validation Error", 400);
console.log(this.message);

}
}
export class NotValidEmail extends ApplicationException {
  constructor(msg: string = "Not Valid Email") {
    super(msg, 400);
    console.log(this.stack);
    
  }
}
export class NOtFoundexception extends ApplicationException {
  constructor(msg: string = "Not Found") {
    super(msg, 404);
    console.log(this.stack);
    
  }
}
export class ExpiredOTPException extends ApplicationException {
  constructor(msg: string = "otp is expired ") {
    super(msg, 404);
    console.log(this.stack);
    
  }
}
export class InvalidCredentialsException extends ApplicationException {
  constructor(msg: string = "credentials is invalid ") {
    super(msg, 400);
    console.log(this.stack);  

  }
}
export class NotConfirmed extends ApplicationException {
  constructor(msg: string = " is not confirmed ") {
    super(msg, 400);
    console.log(this.stack);  

  }
}
export class invalidOtpException extends ApplicationException {
  constructor(msg: string = " is not confirmed ") {
    super(msg, 400);
    console.log(this.stack);  

  }
}
export class invalidTokenException extends ApplicationException {
  constructor(msg: string = " invalid token ") {
    super(msg, 409);
    console.log(this.stack);  

  }
}

export class BadRequestException extends ApplicationException {
  constructor(msg: string = " bad request ") {
    super(msg, 409);
    console.log(this.stack);  

  }
}