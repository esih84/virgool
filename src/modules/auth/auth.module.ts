import { forwardRef, Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UserModule } from "../user/user.module";
import { JwtService } from "@nestjs/jwt";
import { TokenService } from "./tokens.service";
import { GoogleAuthController } from "./google.controller";
import { GoogleStrategy } from "./strategy/google.strategy";

@Module({
  imports: [forwardRef(() => UserModule)],
  // imports: [TypeOrmModule.forFeature([UserEntity, ProfileEntity, OtpEntity])],
  controllers: [AuthController, GoogleAuthController],
  providers: [AuthService, JwtService, TokenService, GoogleStrategy],
  exports: [AuthService, JwtService, TokenService, GoogleStrategy],
})
export class AuthModule {}
