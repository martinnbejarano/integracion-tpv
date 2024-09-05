import crypto from "crypto";

export const generateVerificationToken = (time) => {
  const verificationToken = crypto.randomBytes(20).toString("hex");
  const tokenExpiration = new Date();
  tokenExpiration.setHours(tokenExpiration.getHours() + time);
  return { verificationToken, tokenExpiration };
};
