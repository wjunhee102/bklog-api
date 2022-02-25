import { Controller, Get, Redirect, Req, Res, Body, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
// import { SetCookies } from '@nestjsplus/cookies';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getHello(@Request() req): string {
    console.log(req.user);
    // Redirect('http://localhost:3000');
    return this.appService.getHello();
  }

  // @SetCookies({name: 'test', value: 'test'})
  @Get("/test")
  @Redirect()
  testRedirect(@Req() req) {
    console.log(req.url);
    return { url: `http://localhost:3000/auth/"asdadsda"`}
  }

  @Get("/co") 
  public testCookie(@Res() res) {
    res.cookie("test", "test");
    res.send("sdsd");
  }
}
