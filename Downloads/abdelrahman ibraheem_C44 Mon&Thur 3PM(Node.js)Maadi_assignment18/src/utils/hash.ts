import * as bcrypt from 'bcrypt';

export const createHash = async (text: string): Promise<string> => {
  return await bcrypt.hash(text, process.env.SALT as string);
};

export const compareHash = async (text: string, oldText: string): Promise<boolean> => {
  return await bcrypt.compare(text,oldText);
};