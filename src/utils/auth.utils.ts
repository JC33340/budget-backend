import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

export const generateJWT = (email: string) => {
  return jwt.sign({ email: email }, `${process.env.JWT_SECRET}`, {
    expiresIn: '5 seconds'
  });
};

export const validateToken = (token: string) => {
  let isValid: boolean = false;

  const user = jwt.verify(token, `${process.env.JWT_SECRET}`, (err, user) => {
    if (err) {
      console.log(err);
      isValid = false;
      return '';
    }
    isValid = true;
    const email = JSON.stringify(user).split('"')[3];
    return email;
  });

  return { isValid, user };
};
