import bcrypt from "bcrypt";

export const createHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10)); // register

export const isValidPassword = (user, password) =>
  bcrypt.compareSync(password, user.password); //  login
