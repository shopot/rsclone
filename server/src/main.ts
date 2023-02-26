import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as cookieParser from 'cookie-parser';
import { checkUploadsDir } from './shared/helpers';

async function bootstrap() {
  checkUploadsDir();

  const app = await NestFactory.create(AppModule);

  // Cross-origin resource sharing (CORS)
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const configService: ConfigService = app.get<ConfigService>(ConfigService);

  app.use(cookieParser(configService.get<string>('COOKIE_SECRET')));

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
