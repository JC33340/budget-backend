import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

export const generateJWT = (email: string) => {
  return jwt.sign({ email: email }, `${process.env.JWT_SECRET}`, {
    expiresIn: '2 days'
  });
};

export const validateToken = (token: string) => {
  let isValid: boolean = false;

  const user = jwt.verify(token, `${process.env.JWT_SECRET}`, (err, user) => {
    if (err) {
      console.log(err);
      isValid = false;
      return {};
    }
    isValid = true;
    return user;
  });
  return { isValid, user };
};
