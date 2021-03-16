import { Injectable, Logger } from '@nestjs/common';
import { PageRepository } from './repositories/page.repository';
import { InfoToFindPage, RequiredPageInfo, PageInfoList, PageUserInfo } from './page.type';
import { Page } from 'src/entities/bklog/page.entity';
import { Token } from 'src/util/token.util';
import { MoreThanOrEqual } from 'typeorm';

@Injectable()
export class PageService {
  constructor(
    private readonly pageRepository: PageRepository
  ){}

  /**
   * 
   * @param requiredPageInfo 
   */
  private async insertPage(requiredPageInfo: RequiredPageInfo): Promise<Page> {
    const page: Page = await this.pageRepository.create();

    page.id = Token.getUUID();
    page.userProfile = requiredPageInfo.userProfile;
    page.userId = requiredPageInfo.userId;
    page.title = requiredPageInfo.title;
    page.disclosureScope = requiredPageInfo.disclosureScope;

    await this.savePage(page);

    return await this.findOnePage({id: page.id});
  }

  /**
   * page 정보 찾기
   * @param pageInfo 
   */
  private async findOnePage(pageInfo: InfoToFindPage): Promise<Page> {
    return await this.pageRepository.findOne({
      where: pageInfo
    });
  }

  /**
   * 
   * @param pageInfo 
   */
  private async findPage(pageInfo: InfoToFindPage): Promise<Page[]> {
    return await this.pageRepository.find({
      where: pageInfo
    });
  }

  /**
   * 
   * @param page 
   */
  private async savePage(page: Page) {
    try {
      await this.pageRepository.save(page);

      return true;
    } catch(e) {
      Logger.error(e);

      return false;
    }
  }

  /**
   * 
   * @param page 
   */
  private async deletePage(page: Page): Promise<boolean> {
    try {
      await this.pageRepository.delete(page);

      return true;
    } catch(e) {
      Logger.error(e);

      return false;
    }
  }

  /**
   * 
   * @param requiredPageInfo 
   */
  public async createPage(requiredPageInfo: RequiredPageInfo): Promise<Page> {
    const page: Page | null = await this.insertPage(requiredPageInfo);
    if(page) {
      return page;
    } else {
      return null;
    }
  }

  /**
   * 
   * @param id 
   */
  public async getPage(id: string): Promise<Page> {

    console.log(id);
    const page: Page = await this.pageRepository
      .createQueryBuilder("page")
      .where({
        id
      })
      .leftJoinAndSelect("page.userProfile", "user-profile")
      .leftJoinAndSelect("page.blockList", "block")
      .leftJoinAndSelect("page.versionList", "page-version")
      .leftJoinAndSelect("block.property","block-property")
      .getOne();
  
    console.log("asdasd", page);

    if(!page) {
      return null
    }

    page.lastAccessDate = new Date(Date.now());
    page.views = Number(page.views) + 1;

    await this.savePage(page);

    return page;
  }

  /**
   * 
   * @param pageId 
   * @param userId 
   */
  public async removePage(pageId: string, userId: string): Promise<boolean> {
    const page: Page | null  = await this.findOnePage({id: pageId, userId});

    if(page) {
      const result = await this.deletePage(page);

      return result;
    }

    return false;
  }

  /**
   * 
   * @param profileId 
   * @param scope 
   */
  public async findPublicPageList({ id, penName }: PageUserInfo, scope:number = 4): Promise<PageInfoList[]> {
    if(!scope) {
      console.log(scope);
      return null;
    }

    if(id || penName) { 
      // const pageList: Page[] = await this.pageRepository.find({
      //   relations: ["userProfile"],
      //   where: {
      //     userProfile: {
      //       id: pageUserInfo.id,
      //       penName: pageUserInfo.penName
      //     },
      //     disclosureScope: MoreThanOrEqual(0),
      //   },
      //   order: {
      //     disclosureScope: "ASC",
      //     title: "ASC"
      //   }
      // });

      

      const pageList: Page[] = await this.pageRepository
        .createQueryBuilder("page")
        .leftJoinAndSelect(
          "page.userProfile", 
          "user-profile"
        )
        .where("user-profile.penName = :penName OR user-profile.id = :id", 
          { 
            penName, 
            id
          }
        )
        .andWhere("page.disclosureScope >= :scope", { scope: 0 })
        .select("page.id")
        .addSelect("page.title")
        .addSelect("page.disclosureScope")
        .getMany();

      if(pageList[0]) {
        return pageList;
      }
    } 

    return null;
  }

}
