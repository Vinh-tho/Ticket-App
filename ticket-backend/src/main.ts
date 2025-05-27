import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  // Load biến môi trường từ .env
  dotenv.config();

  const app = await NestFactory.create(AppModule);

  // Cho phép CORS để frontend gọi được API
  app.enableCors();

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
