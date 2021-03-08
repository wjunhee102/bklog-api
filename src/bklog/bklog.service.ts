import { Injectable } from '@nestjs/common';
import { RequiredPageInfo } from './page/page.type';
import { PageService } from './page/page.service';

@Injectable()
export class BklogService {
  constructor(
    private pageService: PageService
  ){}

  public async createBklog(requiredPageInfo: RequiredPageInfo) {
    const pageId: string | null = await this.pageService.createPage(requiredPageInfo);
    
  }

}
