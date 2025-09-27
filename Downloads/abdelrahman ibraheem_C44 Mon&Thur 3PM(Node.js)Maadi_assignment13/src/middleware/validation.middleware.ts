import {request,response} from 'express';
import z from 'zod';
import  {ZodObject} from 'zod';

export const validation =(schema :ZodObject)=>{
    return (req = request, res = response) => {
      const data = {
        ...req.body,
        ...req.params,
        ...req.query
      };
  const result=  schema.safeParse(data);
if (!result.success) {
const errors = result.error.issues.map((error :string|any)=>{  
  return `${error.path}=>${error.message}/n`
   
});
    console.log({errors:errors.join('')});
    // throw new validationError(errors.join(''));

    };
    
}}
