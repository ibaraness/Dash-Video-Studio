import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { createProxyMiddleware, Filter, Options, RequestHandler } from 'http-proxy-middleware';
import { Request } from 'express';
require('dotenv').config();

const filter = function (pathname: string, req: Request) {
  var excluded = /^((\/video)|(\/auth))/gm;
  return !excluded.test(pathname) && req.method === 'GET'
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NEST_MODE === 'dev' ? undefined : false,
  });


  app.useGlobalPipes(new ValidationPipe({
    disableErrorMessages: false
  }));
  app.use(cookieParser());

  // if (process.env.NODE_ENV === "dev") {
  app.enableCors({
    origin: "http://localhost",
    credentials: true
  });

  //   app.use(['/', '/login'], createProxyMiddleware(filter, {
  //     target: 'http://localhost:8080',
  //     changeOrigin: true,
  //     ws: false,
  //     pathRewrite: {
  //       '^/login': '/'
  //     }
  //   }));
  // }

  await app.listen(3000);
}
bootstrap();
