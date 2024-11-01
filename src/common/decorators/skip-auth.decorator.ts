import { SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export const SKIP_AUTH = "SKIP_AUTH";
// export const SkipAuth = () => SetMetadata(SKIP_AUTH, true);
export const SkipAuth = Reflector.createDecorator<string>();
