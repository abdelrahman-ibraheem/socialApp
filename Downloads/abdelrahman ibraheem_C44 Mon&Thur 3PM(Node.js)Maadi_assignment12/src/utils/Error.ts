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