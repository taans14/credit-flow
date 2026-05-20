import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT', 3000);

  app.use(cookieParser());

  // CORS configuration
  app.enableCors({
    origin: configService.get<string>('CLIENT_URL'),
    credentials: true,
  });

  // standardize requests
  app.useGlobalInterceptors(new TransformInterceptor());

  // use Morgan to log HTTP requests/responses
  app.use(morgan('dev'));

  // ValidationPipe to make use of 'class-validator'
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(port ?? 3000);
}
bootstrap();
