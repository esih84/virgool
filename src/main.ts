import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerConfigInit } from "./configs/swagger.config";
import * as cookieParser from "cookie-parser";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const { PORT, COOKIE_SECRET } = process.env;
  app.useGlobalPipes(new ValidationPipe());
  SwaggerConfigInit(app);
  app.useStaticAssets(join(__dirname, "..", "public"));

  app.use(cookieParser(COOKIE_SECRET));
  await app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
    console.log(`swagger: http://localhost:${PORT}/swagger`);
  });
}
bootstrap();
