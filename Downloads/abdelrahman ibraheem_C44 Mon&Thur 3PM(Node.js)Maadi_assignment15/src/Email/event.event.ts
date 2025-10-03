import EventEmitter from "events";
import { sendEmail } from "./sendEmail";

type UserEventTypes = "send-email-activation-code" | "send-reset-password-email";

export class UserEvents{
    constructor(private readonly eventEmitter: EventEmitter = new EventEmitter()) {}

    subscribe(event: UserEventTypes, cp: (payload: any) => void) {
        this.eventEmitter.on(event, cp);
    }
    publish (event: UserEventTypes, payload: any) {
        this.eventEmitter.emit(event, payload);
    }
}
const emitter = new EventEmitter();
export const emailEmitter = new UserEvents(emitter);
emailEmitter.subscribe("send-email-activation-code", async ( {to, subject, html} : 
   { to : string, subject: string, html: string
} )=> {
    await sendEmail({ to, subject, html });


    
     
    });
    emailEmitter.subscribe("send-reset-password-email", async ( {to, subject, html} : 
   { to : string, subject: string, html: string
} )=> {
    await sendEmail({ to, subject, html });})

