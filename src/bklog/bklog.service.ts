import { Injectable } from '@nestjs/common';
import { RequiredPageInfo } from './page/page.type';
import { PageService } from './page/page.service';
import { BlockService } from './block/block.service';
import { ResCreateBlockDate } from './block/block.type';
import { RequiredPageListInfo } from './bklog.type';

@Injectable()
export class BklogService {
  constructor(
    private readonly pageService: PageService,
    private readonly blockService: BlockService
  ){}

  public async createBklog(requiredPageInfo: RequiredPageInfo): Promise<string> {
    const pageId: string | null = await this.pageService.createPage(requiredPageInfo);

    if(pageId) {
      const resCreateBlockData: ResCreateBlockDate | null = await this.blockService.createFirstBlock({
        pageId,
        type: "text"
      });

      if(resCreateBlockData) {
        return pageId;
      } else {
        await this.pageService.removePage(pageId, requiredPageInfo.userId);
      }
    } 

    return null;
  }

  public async findPageList({penName, id}: RequiredPageListInfo) {


  }

}
