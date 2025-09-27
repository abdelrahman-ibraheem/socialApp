
import { Schema, type HydratedDocument } from 'mongoose';
import { model } from 'mongoose';
import { BadRequestException } from '../../utils/Error';
import { string } from 'zod';
import {createHash}from "../../utils/hash"
import { emailEmitter } from '../../Email/event.event';
type  otpType={
otp : string,
expiresAt: Date|undefined
      
}
export interface IUser extends Document  {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  otp: string;
  expiresAt?: Date;
  phone: string;
  emailOtp:  otpType
  passwordOtp?: otpType,
  slug:string,
    
      isConfirmed: Boolean ,
      iscredentialsUpdated: Date,
  coverImage?: string[],
      profileImage?:string
      



    
  };

const userSchema = new Schema<IUser>({
firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  emailOtp: {
    otp: String,
    expiresAt: Date,
  },
  phone: {
    type:String,
    password: {
    type: String,
    required: true,
  },
  emailOtp: {
    otp: String,
    expiresAt: Date,
      type : undefined,
  },
   passwordOtp: {
    otp: String,
    expiresAt: Date,
  },
  phone: {
    type: String,
  },
  isConfirmed: {
    type: Boolean,
    default: false, 
  },
isCOnfirmed: {
    type: Boolean,
    default: false,},
    slug  :{ 
      type: string
    },
    iscredentialsUpdated: {
      type: Date,
    } ,
     coverImage: [{ type: String }]   // ✅ array of strings
,
    profileImage: {
        type : String
    },


  }
},


 {
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
});

userSchema
  .virtual("username")
  .set(function (value: string) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName, slug: value.replaceAll(/\s+/g, "-") });
  })
  .get(function () {
    return `${this.firstname} ${this.lastname}`;
  });

userSchema.pre("validate", function (next) {
  console.log("Pre Hook", this.modifiedPaths().includes('password') );
  if (!this.slug?.includes("-")) {
    throw new BadRequestException(
      "Slug is Required and must hold - like ex: first-name-last-name"
    );
  }
});
userSchema.pre('save',async function(this:HydratedDocument<IUser>&{wasNew:boolean},next){
  this.wasNew= this.isNew
if(this.isModified("password")){
  this.password= await createHash(this.password);

}

next();
})
userSchema.post ('save',function(doc,next){
  const that=this as HydratedDocument<IUser>& {wasNew:boolean};

console.log(that.wasNew);
if (this.isNew) {
  emailEmitter.publish("send-email-activation-code", { to: this.email, otp:123456});
  
}
  
})

export const userModel = model<IUser>('User', userSchema);
