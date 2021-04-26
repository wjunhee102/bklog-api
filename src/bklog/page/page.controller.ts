import { Controller, Get, Param, Query } from '@nestjs/common';
import { PageService } from './page.service';
import { PageInfoList } from './page.type';
import { ResponseMessage } from 'src/utils/base/response.util';

@Controller('page')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Get('list/:penName')
  async getPageList(@Param() params, @Query() query) {
    console.log(params,"2323", query? true : false);
    const pageInfoList: PageInfoList[] | null = await this.pageService.findPublicPageList(params.penName);

    if(pageInfoList) {
      return ResponseMessage({success: true, pageList: pageInfoList});
    } else {
      return ResponseMessage({success: false, pageList: null});
    }
  }

}
