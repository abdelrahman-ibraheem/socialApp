
import mongoose, { Schema, type HydratedDocument, type UpdateQuery } from 'mongoose';
import { model } from 'mongoose';
import { BadRequestException } from '../../utils/Error';
import { boolean, date, string } from 'zod';
import {createHash}from "../../utils/hash"
import { emailEmitter } from '../../utils/Email/event.event';
import { Query } from "mongoose";
import { template } from '../../utils/generateHTML';

type  otpType={
otp : string,
expiresAt: Date|undefined
      
}
export interface IUser extends Document  {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  otp?: string;
  expiresAt?: Date;
  phone: string;
  emailOtp:  otpType
  passwordOtp?: otpType,
  slug:string,
    otpExpires: Date,
    tempEmail:string,
      isConfirmed: Boolean ,
      iscredentialsUpdated: Date,
  coverImage?: string[],
      profileImage?:string,
      deleteAt:Date,
      filter: string,
      friends:string,
        tags: mongoose.Types.ObjectId[];
      isBlocked: boolean;
      wasNew?:boolean
      firstCreation?:boolean
      plainTextOtp?:string
        content: string;
        roomId:string 


      



    
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
        
        otpExpires: { type:Date
},
tempEmail:{
  type :string
},
otp:{   
  type: string
},
deleteAt:{
  type :Date  
},
    iscredentialsUpdated: {
      type: Date,
    } ,
     coverImage: [{ type: String }]   // ✅ array of strings
,
    profileImage: {
        type : String
    },
    filter:{type:string},
    roomId:{ type:string} 





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



userSchema.pre('save',async function(this:HydratedDocument<IUser>&{firstCreation:boolean,plainTextOtp?:string} , next){
  console.log({new: this.isNew});
  this.firstCreation = this.isNew
this.plainTextOtp = this.emailOtp?.otp as string

  if (this.isModified('password')) {
    this.password = await createHash(this.password)
    
  }
  if (this.isModified('emailOtp')) {
    this.emailOtp={
      otp: await createHash(this.emailOtp?.otp||''),
      expiresAt:this.emailOtp?.expiresAt as Date
    }
    
  }
  
})
userSchema.post('save',async function (doc,next) {

const that= this as HydratedDocument<IUser>&{firstCreation:boolean,plainTextOtp?:string}

if (that.firstCreation) {
  

     const subject = "use this otp to confirm your email";
  const html = template( that.plainTextOtp as string,  `${doc.firstname} ${doc.lastname}`, subject);
  emailEmitter.publish("send-email-activation-code", { to: doc.email, subject, html });
  
}



})
userSchema.pre(['findOne','find'],function(next){
  const query = this.getQuery()
  if (query.paranoId===false) {
    this.setQuery({...query})

    
  }else{
    this.setQuery({...query,deleteAt:{$exists:false}})
  }
  next()
})
userSchema.pre(['findOneAndUpdate','updateOne'],function(next){
  const update = this.getUpdate() as UpdateQuery<HydratedDocument<IUser>>
  if (update.deleteAt) {
    this.setUpdate({ ...update,iscredentialsUpdated:new Date()})
    
  }
  if (update.password) {
    const hashedPassword= createHash(update.password as string)
    this.setUpdate({...update,password:hashedPassword,iscredentialsUpdated:new Date()})
    
  }
  next()
})


function applyParanoidAndOptions(this: Query<any, IUser>, next: () => void) {
  const query = this.getQuery();

  if (query.paranoid === false) {
    this.setQuery({ ...query }); // no soft-delete filter
  } else {
    this.setQuery({ ...query, deleteAt: { $exists: false } }); // only not deleted
  }

  const options = this.getOptions();

  if (options.skip && options.skip < 0) {
    this.setOptions({ ...options, skip: 0 });
  }

  if (options.limit && options.limit <= 0) {
    this.setOptions({ ...options, limit: 5 });
  }
  next();
}



userSchema.pre('insertMany',function(next,docs){
  console.log(
    {this:this,
      docs
    }
  );
  next()

})

userSchema.post('insertMany',function(docs,next){
  console.log(
    {this:this,
      docs
    }
  );
  next()

})






export const userModel = model<IUser>('User', userSchema);
