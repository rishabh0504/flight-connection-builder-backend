import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { FLIGHTS, FLIGHT_SCHEDULES } from './constants';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('/flights')
  getFlights(): any[] {
    return FLIGHTS;
  }
  @Get('/flight-schedules')
  scheduleFlights(): any[] {
    return FLIGHT_SCHEDULES;
  }

  @Post('/flights')
  async flights(@Body() payload: any): Promise<any[]> {
    return await this.appService.searchFlight(payload);
  }
}
