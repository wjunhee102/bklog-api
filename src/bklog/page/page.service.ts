import { Injectable, Logger } from '@nestjs/common';
import { PageRepository } from './repositories/page.repository';
import { InfoToFindPage, RequiredPageInfo } from './page.type';
import { Page } from 'src/entities/bklog/page.entity';
import { Token } from 'src/util/token.util';

@Injectable()
export class PageService {
  constructor(
    private readonly pageRepository: PageRepository
  ){}

  /**
   * page 정보 찾기
   * @param pageInfo 
   */
  private async findOneUser(pageInfo: InfoToFindPage) {
    return await this.pageRepository.findOne({
      where: pageInfo
    });
  }

  private async savePage(page: Page) {
    try {
      await this.pageRepository.save(page);

      return true;
    } catch(e) {
      Logger.error(e);

      return false;
    }
  }

  private async insertPage(requiredPageInfo: RequiredPageInfo): Promise<Page | null> {
    try {
      const page: Page = await this.pageRepository.create();

      page.id = Token.getUUID();
      page.profileId = requiredPageInfo.profileId;
      page.userId = requiredPageInfo.userId;
      page.title = requiredPageInfo.title;

      return page;
      
    } catch(e) {
      Logger.error(e);

      return null;
    }
  }

  public async createPage(requiredPageInfo: RequiredPageInfo): Promise<string | null> {
    const page: Page | null = await this.insertPage(requiredPageInfo);
    if(page) {
      return page.id;
    } else {
      return null;
    }
  }

}
