import { Body, Controller, Get, Param, Post, Query, Req, Res } from '@nestjs/common';
import { PageService } from './page.service';
import { PageInfoList } from './page.type';
import { ResponseMessage } from 'src/utils/common/response.util2';

@Controller('page')
export class PageController {
  constructor(
    private readonly pageService: PageService
  ){}

  @Get('list/:penName')
  async getPageList(@Param() params: any, @Query() query: any) {
    console.log(params,"2323", query? true : false);
    const pageInfoList = await this.pageService.findPublicPageList(params.penName);

    if(pageInfoList) {
      return ResponseMessage({success: true, pageList: pageInfoList});
    } else {
      return ResponseMessage({success: false, pageList: null});
    }
  }
}
