import { SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Roles } from "../enums/role.enum";

// TODO: custom role decorator
export const ROLE_KEY = "ROLES";
export const CanAccess = (...roles: Roles[]) => SetMetadata(ROLE_KEY, roles);
