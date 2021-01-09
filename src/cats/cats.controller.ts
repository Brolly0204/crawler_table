import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express'
import { CatsService } from './cats.service'
import { Cat } from './interfaces/cat.interface'

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Post()
  create(@Body() cat: Cat) {
    console.log('cat', cat)
    this.catsService.create(cat);
  }

  @Get()
  findAll(@Req() request: Request): Cat[] {
    return this.catsService.findAll();
  }
}
