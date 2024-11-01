import { ApiProperty } from "@nestjs/swagger";
import { AuthType } from "../enums/type.enum";
import { AuthMethod } from "../enums/method.enum";
import { IsEnum, IsString, Length } from "class-validator";

export class AuthDto {
  @ApiProperty()
  @IsString()
  @Length(2, 100)
  username: string;
  @ApiProperty({ enum: AuthType })
  @IsEnum(AuthType)
  type: AuthType;
  @ApiProperty({ enum: AuthMethod })
  @IsEnum(AuthMethod)
  method: AuthMethod;
}

export class CheckOtpDto {
  @ApiProperty()
  @IsString()
  @Length(5, 5)
  code: string;
}
