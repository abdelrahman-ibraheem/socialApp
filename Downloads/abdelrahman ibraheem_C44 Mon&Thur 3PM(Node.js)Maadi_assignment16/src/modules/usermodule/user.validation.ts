import z from 'zod';

export const signupSchema = z.object({
    firstName: z.string().min(3).max(15),
    lastName: z.string().min(3).max(15),
    email: z.string().email(),
    password: z.string().min(8).max(20),
    phone: z.string().min(10).max(11).optional(),
    confirmPassword: z.string(),
}).superRefine((args: z.infer<typeof signupSchema>, ctx: z.RefinementCtx) => {
    if (args.confirmPassword !== args.password) {
        ctx.addIssue({
            code: 'custom',
            path: ['confirmPassword'],
            message: 'confirm password must be equal to password'
        });
    }


});
export const confirmEmailSchema = z.object({
    email: z.email,
otp : z.string().length(6) 
});


export const resendOtpSchema = z.object({
    email: z.email()

})
export const loginSchema = z.object({
    email: z.email()
    , password: z.string().min(8).max(20)


})
export const forgetPasswordSchema = z.object({
    email: z.email()


})
