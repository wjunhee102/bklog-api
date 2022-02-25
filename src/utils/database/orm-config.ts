import { TypeOrmModuleOptions } from "@nestjs/typeorm";

const ormConfig: () => TypeOrmModuleOptions = () => {
  return {
    type: "mysql",
    host: "localhost",
    port: process.env.DATABASE_PORT? parseInt(process.env.DATABASE_PORT) : 3306,
    username: process.env.DATABASE_USER? process.env.DATABASE_USER : "junhee",
    password: process.env.DATABASE_PASSWORD? process.env.DATABASE_PASSWORD : "password",
    database: process.env.DATABASE? process.env.DATABASE : "bklog",
    entities: [
      "dist/src/entities/*.entity{.ts,.js}", 
      "dist/src/entities/**/*.entity{.ts,.js}",
      "dist/src/auth/**/entities/*.entity{.ts,.js}",
      "entities/**/*.entity{.ts,.js}",
      "entities/*.entity{.ts,.js}",
      "auth/**/entities/*.entity{.ts,.js}"
    ],
    logging: true,
    synchronize: true
  };
} 

export default ormConfig;