import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export function TypeOrmConfig(): TypeOrmModuleOptions {
  const { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME } = process.env;
  return {
    port: +DB_PORT,
    host: DB_HOST,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    type: "postgres",
    autoLoadEntities: false,
    synchronize: true,
    entities: [
      "dist/**/**/**/*.entity{.js,.ts}",
      "dist/**/**/**/*.entity{.js,.ts}",
    ],
  };
}
