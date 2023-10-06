import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { CreateUserDto, UserLoginDto } from 'src/user/user.model';
import { LocalAuthGuard } from './guards/local.guard';
import { Response } from 'express';
import RequestWithUser from './request-with-user.interface';
import { JwtAuthGuard } from './jwt.guard';
import JwtRefreshGuard from './guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Req() request: RequestWithUser, @Res() response: Response) {
    const { user } = request;
    const accessTokenCookie = this.authService.getCookieWithJwtToken(user.id);
    const { cookie: refreshTokenCookie, token: refreshToken } =
      this.authService.getCookieWithRefreshToken(user.id);

    await this.userService.setRefreshToken(refreshToken, user.id);

    response.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
    user.password = undefined;
    return response.send(user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async authenticate(@Req() request: RequestWithUser) {
    const user = request.user;
    user.password = undefined;
    return user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() request: RequestWithUser, @Res() res: Response) {
    await this.userService.removeRefreshToken(request.user.id);
    res.setHeader('Set-Cookie', this.authService.getCookiesForLogout());
    return res.sendStatus(200);
  }

  @Get('refresh')
  @UseGuards(JwtRefreshGuard)
  async refreshToken(@Req() request: RequestWithUser) {
    const accessTokenCookie = this.authService.getCookieWithJwtToken(
      request.user.id,
    );

    request.res.setHeader('Set-Cookie', accessTokenCookie);
    return request.user;
  }
}
