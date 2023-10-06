import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  refreshToken: String,
});

export interface User {
  id: mongoose.ObjectId;
  email: string;
  password: string;
  refreshToken: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
}

export interface UserLoginDto {
  email: string;
  password: string;
}