import { Injectable, Logger } from '@nestjs/common';
import { PageRepository } from './repositories/page.repository';
import { InfoToFindPage, RequiredPageInfo, PageInfoList } from './page.type';
import { Page } from 'src/entities/bklog/page.entity';
import { Token } from 'src/util/token.util';
import { MoreThan, MoreThanOrEqual, Like } from 'typeorm';
import { UserProfile } from 'src/entities/user/user-profile.entity';

@Injectable()
export class PageService {
  constructor(
    private readonly pageRepository: PageRepository
  ){}

  /**
   * page 정보 찾기
   * @param pageInfo 
   */
  private async findOnePage(pageInfo: InfoToFindPage): Promise<Page> {
    return await this.pageRepository.findOne({
      where: pageInfo
    });
  }

  private async findPage(pageInfo: InfoToFindPage): Promise<Page[]> {
    return await this.pageRepository.find({
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
      page.userProfile = requiredPageInfo.userProfile;
      page.userId = requiredPageInfo.userId;
      page.title = requiredPageInfo.title;
      page.disclosureScope = requiredPageInfo.disclosureScope;

      this.savePage(page);
      console.log(page);
      return page;
      
    } catch(e) {
      Logger.error(e);

      return null;
    }
  }

  private async deletePage(page: Page): Promise<boolean> {
    try {
      await this.pageRepository.delete(page);

      return true;
    } catch(e) {
      Logger.error(e);

      return false;
    }
  }

  public async createPage(requiredPageInfo: RequiredPageInfo): Promise<string | null> {
    const page: Page | null = await this.insertPage(requiredPageInfo);
    if(page) {
      console.log(page);
      return page.id;
    } else {
      return null;
    }
  }

  public async removePage(pageId: string, userId: string): Promise<boolean> {
    const page: Page | null  = await this.findOnePage({id: pageId, userId});

    if(page) {
      const result = await this.deletePage(page);

      return result;
    }

    return false;
  }

  public async findPublicPageList(profileId, scope:number = 4): Promise<PageInfoList[]> {
    if(!scope) {
      console.log(scope);
      return null;
    }

    if(profileId) { 
      const pageList: Page[] = await this.pageRepository.find({
        where: {
          profileId,
          disclosureScope: MoreThanOrEqual(4),
        },
        order: {
          disclosureScope: "ASC",
          title: "ASC"
        }
      });

      console.log(pageList);

      if(pageList[0]) {
        return pageList.map((page) => {
          return {
            pageId: page.id,
            title: page.title,
            disclosureScope: page.disclosureScope
          }
        });
      }
    } 

    return null;
  }

}
