import { Request } from "express";
import { mkdirSync } from "fs";
import { extname, join } from "path";
import { ValidationMessage } from "../enums/message.enum";
import { BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";
export type CallBackDestination = (
  error: Error | null,
  fileName: string
) => void;
export type CallBackFileName = (
  error: Error | null,
  destination: string
) => void;

export type multerFile = Express.Multer.File;

// To specify the file storage address
export function multerDestination(fieldName: string) {
  return function (
    req: Request,
    file: multerFile,
    callback: CallBackDestination
  ): void {
    let path = join("public", "uploads", fieldName);
    mkdirSync(path, { recursive: true });
    callback(null, path);
  };
}

export function multerFileName(
  req: Request,
  file: multerFile,
  callback: CallBackFileName
): void {
  const ext = extname(file.originalname).toLowerCase();
  if (!isValidImageFormat(ext)) {
    callback(
      new BadRequestException(ValidationMessage.InavlidImageFormat),
      null
    );
  } else {
    const fileName = `${Date.now()}${ext}`;
    callback(null, fileName);
  }
}
function isValidImageFormat(ext: string) {
  return [".png", ".jpg", ".jpeg"].includes(ext);
}

export function multerStorage(folderName: string) {
  return diskStorage({
    destination: multerDestination(folderName),
    filename: multerFileName,
  });
}
