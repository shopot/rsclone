import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as cookieParser from 'cookie-parser';
import { COOKIE_SECRET } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser(COOKIE_SECRET));

  // Cross-origin resource sharing (CORS)
  app.enableCors({
    origin: '*',
  });

  const configService: ConfigService = app.get<ConfigService>(ConfigService);

  const port = configService.get('PORT') || 3000;

  await app.listen(port);

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
