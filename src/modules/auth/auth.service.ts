import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthDto, CheckOtpDto } from "./dto/auth.dto";
import { AuthType } from "./enums/type.enum";
import { AuthMethod } from "./enums/method.enum";
import { isEmail, isMobilePhone } from "class-validator";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../user/entities/user.entity";
import { Repository } from "typeorm";
import { ProfileEntity } from "../user/entities/profile.entity";
import {
  AuthMessage,
  BadRequestMessage,
  PublicMessage,
} from "src/common/enums/message.enum";
import { OtpEntity } from "../user/entities/otp.entity";
import { randomInt } from "crypto";
import { TokenService } from "./tokens.service";
import { Request, Response } from "express";
import { CookieKeys } from "src/common/enums/cookie.enum";
import { AuthResponse, GoogleUser } from "./types/response";
import { REQUEST } from "@nestjs/core";
import { CookieOptionsToken } from "src/common/utils/cookie.utils";
import { KavenegarService } from "../http/covenegar.service";
import { randomId } from "src/common/utils/function.utils";

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    @InjectRepository(OtpEntity)
    private otpRepository: Repository<OtpEntity>,
    @Inject(REQUEST) private request: Request,
    private tokenService: TokenService,
    private kavenegarService: KavenegarService
  ) {}

  async userExistence(authDto: AuthDto, res: Response) {
    const { method, type, username } = authDto;
    let result: AuthResponse;
    switch (type) {
      case AuthType.Login:
        result = await this.login(method, username);
        await this.sendOtp(method, username, result.code);
        return this.sendResponse(res, result);
      case AuthType.Register:
        result = await this.register(method, username);
        await this.sendOtp(method, username, result.code);

        return this.sendResponse(res, result);
      default:
        throw new UnauthorizedException();
    }
  }

  async login(method: AuthMethod, username: string) {
    const validUsername = this.usernameValidator(method, username);
    const user: UserEntity = await this.checkExistUser(method, validUsername);
    if (!user) throw new UnauthorizedException(AuthMessage.NotFoundAccount);
    const otp = await this.saveOtp(user.id, method);
    const token = this.tokenService.createOtpToken({ userId: user.id });

    return {
      token,
      code: otp.code,
    };
  }

  async register(method: AuthMethod, username: string) {
    const validUsername = this.usernameValidator(method, username);
    let user: UserEntity = await this.checkExistUser(method, validUsername);
    if (user) {
      throw new ConflictException(AuthMessage.AlreadyExistAccount);
    }

    if (method === AuthMethod.Username) {
      throw new BadRequestException(BadRequestMessage.InValidRegisterData);
    }
    user = this.userRepository.create({
      [method]: username,
    });
    user = await this.userRepository.save(user);
    user.username = `v_${user.id}`;
    await this.userRepository.save(user);

    const otp = await this.saveOtp(user.id, method);

    // create token for get userId  in checkOtp
    const token = this.tokenService.createOtpToken({ userId: user.id });
    return {
      token,
      code: otp.code,
    };
  }

  ////*
  usernameValidator(method: AuthMethod, username: string) {
    switch (method) {
      case AuthMethod.Email:
        if (isEmail(username)) return username;
        throw new BadRequestException("email is incorrect");
      case AuthMethod.Phone:
        if (isMobilePhone(username, "fa-IR")) return username;
        throw new BadRequestException("phone is  incorrect");
      case AuthMethod.Username:
        return username;

      default:
        throw new UnauthorizedException("username data is not valid");
    }
  }

  async checkExistUser(method: AuthMethod, username: string) {
    let user: UserEntity;

    if (method === AuthMethod.Phone) {
      user = await this.userRepository.findOneBy({ phone: username });
    } else if (method === AuthMethod.Email) {
      user = await this.userRepository.findOneBy({ email: username });
    } else if (method === AuthMethod.Username) {
      user = await this.userRepository.findOneBy({ username });
    } else {
      throw new BadRequestException(BadRequestMessage.InValidLoginData);
    }
    return user;
  }

  async saveOtp(userId: number, method: AuthMethod) {
    const code = randomInt(10000, 99999).toString();
    const expires_in = new Date(Date.now() + 1000 * 60 * 2);
    let otp = await this.otpRepository.findOneBy({ userId });
    let existOtp = false;
    if (otp) {
      existOtp = true;
      otp.code = code;
      otp.expires_in = expires_in;
      otp.method = method;
    } else {
      otp = this.otpRepository.create({
        code,
        expires_in,
        userId,
        method,
      });
    }
    otp = await this.otpRepository.save(otp);
    if (!existOtp) {
      await this.userRepository.update({ id: userId }, { otpId: otp.id });
    }
    return otp;
    //? send[Sms,email]OtpCode
  }

  async sendOtp(method: AuthMethod, username: string, code: string) {
    if (method === AuthMethod.Email) {
      //?send Email
    } else if (method === AuthMethod.Phone) {
      // await this.kavenegarService.sendVerificationSms(username, code);
    }
  }
  // for set otpToken in cookies
  async sendResponse(res: Response, result: AuthResponse) {
    //code
    const { token, code } = result;
    res.cookie(CookieKeys.OTP, token, CookieOptionsToken());
    res.json({
      message: PublicMessage.SentOtp,
      code,
    });
  }

  async checkOtp(code: string) {
    const token = this.request.cookies?.[CookieKeys.OTP];
    if (!token) throw new UnauthorizedException(AuthMessage.LoginAgain);
    const { userId } = this.tokenService.verifyOtpToken(token);
    const otp = await this.otpRepository.findOneBy({ userId });
    if (!otp) throw new UnauthorizedException(AuthMessage.LoginAgain);
    const now = new Date();
    if (otp.expires_in < now)
      throw new UnauthorizedException(AuthMessage.ExpiredCode);
    if (otp.code !== code)
      throw new UnauthorizedException(AuthMessage.TryAgain);
    const accessToken = this.tokenService.createAccessToken({ userId });
    if (otp.method === AuthMethod.Email) {
      await this.userRepository.update(
        { id: userId },
        {
          verify_email: true,
        }
      );
    } else if (otp.method === AuthMethod.Phone) {
      await this.userRepository.update(
        { id: userId },
        {
          verify_phone: true,
        }
      );
    }
    return {
      message: PublicMessage.LoggedIn,
      accessToken,
    };
  }
  async validateAccessToken(token: string) {
    const { userId } = this.tokenService.verifyAccessToken(token);
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException(AuthMessage.LoginAgain);

    return user;
  }

  async googleAuth(userData: GoogleUser) {
    const { email, firstName, lastName } = userData;
    let user = await this.userRepository.findOneBy({ email });
    let token: string;
    if (user) {
      // token = this.tokenService.createOtpToken({ userId: user.id });
      token = this.tokenService.createAccessToken({
        userId: user.id,
      });
    } else {
      user = this.userRepository.create({
        email,
        verify_email: true,
        username: email.split("@")["0"] + randomId(),
      });
      user = await this.userRepository.save(user);
      let profile = this.profileRepository.create({
        userId: user.id,
        nick_name: `${firstName} ${lastName}`,
      });
      profile = await this.profileRepository.save(profile);
      user.profileId = profile.id;
      await this.userRepository.save(user);
      token = this.tokenService.createAccessToken({
        userId: user.id,
      });
    }
    return {
      token,
    };
  }
}
