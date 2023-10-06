import { Body, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CreateUserDto, User } from './user.model';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {
  constructor(@InjectModel('user') private readonly userModel: Model<User>) {}

  getUsers() {
    return this.userModel.find();
  }

  async getById(userId: ObjectId) {
    const user = await this.userModel.findById(userId);

    if(user) {
      return user;
    }
    throw new NotFoundException("User with given id does not exist");
  }

  async createUser(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = new this.userModel({ ...createUserDto, password: hashedPassword });

    const result = await newUser.save();
    return result.id;
  }

  async validateUser(loggingUser: User) {
    const user: User = await this.userModel.findOne({
        email: loggingUser.email,
    });

    if (!user) {
        throw new ForbiddenException('Invaild username or password');
    }

    const passwordMatch = await bcrypt.compare(
        loggingUser.password,
        user.password,
    );

    if (!passwordMatch) {
        throw new ForbiddenException('Invalid username or password');
    }

    return true;
  }

  async findUserByEmail(email: string, withPassword: boolean = false) {
    const user = withPassword ?
                  await this.userModel.findOne({ email: email }) :
                  await this.userModel.findOne({ email: email }).select('+password');

    return user;
  }

  async setRefreshToken(refreshToken: string, userId: ObjectId) {
    const currentRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userModel.updateOne({_id: userId}, { $set: { refreshToken: currentRefreshToken }})
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: ObjectId) {
    const user = await this.getById(userId);
    user.password = undefined;

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.refreshToken
    );

    if(isRefreshTokenMatching) {
      return user;
    }
  }

  async removeRefreshToken(userId: ObjectId) {
    return this.userModel.updateOne({ _id: userId }, { $unset: { refreshToken: "" } })
  }
}
