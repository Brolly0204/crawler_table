import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor() {
    console.log('App Service')
  }

  getHello(): string {
    return 'Hello World!';
  }
}
