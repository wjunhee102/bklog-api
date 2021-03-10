import { Injectable, Logger } from '@nestjs/common';
import { PageRepository } from './repositories/page.repository';
import { InfoToFindPage, RequiredPageInfo, PageInfoList } from './page.type';
import { Page } from 'src/entities/bklog/page.entity';
import { Token } from 'src/util/token.util';
import { UserService } from 'src/user/user.service';

@Injectable()
export class PageService {
  constructor(
    private readonly pageRepository: PageRepository,
    private readonly userService: UserService
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
      page.profileId = requiredPageInfo.profileId;
      page.userId = requiredPageInfo.userId;
      page.title = requiredPageInfo.title;
      page.private = requiredPageInfo.private;

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

  public async findPublicPageList(penName: string): Promise<PageInfoList[]> {
    const profileId = await this.userService.findUserProfileId(penName);

    if(profileId) {
      const pageList: Page[] = await this.findPage({ profileId, private: 4 });

      if(pageList[0]) {
        return pageList.map((page) => {
          return {
            pageId: page.id,
            title: page.title
          }
        });
      }
    } 

    return null;
  }

}
