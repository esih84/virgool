import {
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiTags } from "@nestjs/swagger";
import {
  ChangeEmailDto,
  ChangePhoneDto,
  ChangeUsernameDto,
  ProfileDto,
} from "./dto/profile.dto";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { multerStorage } from "src/common/utils/multer.util";
import { ProfileImage } from "./types/files";
import { UploadedOptionalFiles } from "src/common/decorators/upload-file.decorator";
import { Response } from "express";
import { CookieKeys } from "src/common/enums/cookie.enum";
import { CookieOptionsToken } from "src/common/utils/cookie.utils";
import { PublicMessage } from "src/common/enums/message.enum";
import { CheckOtpDto } from "../auth/dto/auth.dto";
import { AuthDecorator } from "src/common/decorators/auth.decorator";
import { CanAccess } from "src/common/decorators/role.decorator";
import { Roles } from "src/common/enums/role.enum";
import { Pagination } from "src/common/decorators/pagination.decorator";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { UserBlockDto } from "./dto/user-block.dto";

@Controller("user")
@ApiTags("user")
@AuthDecorator()
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Put("change-profile")
  @ApiConsumes(SwaggerConsumes.MultipartData)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "image_profile", maxCount: 1 },
        { name: "bg_image", maxCount: 1 },
      ],
      {
        storage: multerStorage("user-profile"),
      }
    )
  )
  changeProfile(
    @UploadedOptionalFiles()
    files: ProfileImage,
    @Body()
    profileDto: ProfileDto
  ) {
    return this.userService.changeProfile(files, profileDto);
  }
  @Get("/profile")
  profile() {
    return this.userService.profile();
  }

  @Patch("/change-email")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changeEmail(@Body() emailDto: ChangeEmailDto, @Res() res: Response) {
    const { code, token, message } = await this.userService.changeEmail(
      emailDto.email
    );
    if (message) {
      res.json({ message });
    }
    res.cookie(CookieKeys.EmailOTP, token, CookieOptionsToken());
    res.json({
      code,
      message: PublicMessage.SentOtp,
    });
  }
  @Post("/verify-email-otp")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async verifyEmail(@Body() otpDtp: CheckOtpDto) {
    return this.userService.verifyEmail(otpDtp.code);
  }
  @Patch("/change-phone")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changePhone(@Body() phoneDto: ChangePhoneDto, @Res() res: Response) {
    const { code, token, message } = await this.userService.changePhone(
      phoneDto.phone
    );
    if (message) {
      res.json({ message });
    }
    res.cookie(CookieKeys.PhoneOTP, token, CookieOptionsToken());
    res.json({
      code,
      message: PublicMessage.SentOtp,
    });
  }
  @Post("/verify-phone-otp")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async verifyPhone(@Body() otpDtp: CheckOtpDto) {
    return this.userService.verifyPhone(otpDtp.code);
  }
  @Patch("/change-username")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changeUsername(@Body() usernameDto: ChangeUsernameDto) {
    return this.userService.changeUsername(usernameDto.username);
  }
  @Get("/follow/:followingId")
  @ApiParam({ name: "followingId" })
  follow(@Param("followingId", ParseIntPipe) followingId: number) {
    return this.userService.followToggle(followingId);
  }

  @Get("/user-list")
  @CanAccess(Roles.Admin)
  @Pagination()
  findAllUser(@Query() paginationDto: PaginationDto) {
    return this.userService.findAllUser(paginationDto);
  }

  @Get("/followers")
  @Pagination()
  followers(@Query() paginationDto: PaginationDto) {
    return this.userService.followers(paginationDto);
  }
  @Get("/following")
  @Pagination()
  following(@Query() paginationDto: PaginationDto) {
    return this.userService.following(paginationDto);
  }

  @Post("/block")
  @CanAccess(Roles.Admin)
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async block(@Body() blockDto: UserBlockDto) {
    return this.userService.block(blockDto);
  }
}
