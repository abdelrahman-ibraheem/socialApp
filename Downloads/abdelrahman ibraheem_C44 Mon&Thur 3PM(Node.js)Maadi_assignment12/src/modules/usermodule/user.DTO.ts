import { z } from 'zod';
import { signupSchema } from './user.validation';

export type signupDTO = z.infer<typeof signupSchema>;