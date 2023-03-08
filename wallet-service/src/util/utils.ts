import bcrypt from "bcrypt";

export const hashString = async (what: string): Promise<string> => {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(what, salt);
};
