import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { User } from 'src/user/user.model';
import * as jwt from 'jsonwebtoken';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { ObjectId } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findUserByEmail(email, true);

      if (!(user && (await bcrypt.compare(password, user.password)))) {
        throw new BadRequestException("Invalid username or password");
      }
      user.password = undefined;
      return user;
    }
    catch(err) {
      throw new BadRequestException("Invalid username or password")
    }
  }

  async generateToken(user: User) {
    const payload = { email: user.email };

    return {
      access_token: jwt.sign(payload, 'secretKey', { expiresIn: '24h' }),
    };
  }

  getCookieWithJwtToken(userId: ObjectId) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN')
    });
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_EXPIRES_IN')}`
  }

  getCookieWithRefreshToken(userId: ObjectId) {
    const secret = this.configService.get('REFRESH_TOKEN_SECRET');
    const expiresIn = this.configService.get('REFRESH_TOKEN_EXPIRES_IN');

    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload, {
      secret,
      expiresIn
    });
    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${expiresIn}`;
    return {
      cookie,
      token
    }
  }

  public getCookiesForLogout() {
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0'
    ];
  }
}

export interface TokenPayload {
  userId: ObjectId;
}
