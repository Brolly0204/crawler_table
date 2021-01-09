import { join } from 'path';
import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import 'dotenv/config'

const port = process.env.PORT
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );
  app.useStaticAssets(join(__dirname, '..', 'dist'))
  await app.listen(port, () => {
    Logger.log(`start in ${port}`)
  });
}
bootstrap();
