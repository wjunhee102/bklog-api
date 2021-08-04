import { Controller, Get, Redirect, Req, Res, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express'
// import { SetCookies } from '@nestjsplus/cookies';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    // Redirect('http://localhost:3000');
    return this.appService.getHello();
  }

  // @SetCookies({name: 'test', value: 'test'})
  @Get("/test")
  @Redirect()
  testRedirect(@Req() req: Request) {
    console.log(req.url);
    return { url: `http://localhost:3000/auth/"asdadsda"`}
  }

  @Get("/co") 
  public testCookie(@Res() res: Response) {
    res.cookie("test", "test");
    res.send("sdsd");
  }
}
