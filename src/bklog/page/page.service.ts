import { Injectable, Logger } from '@nestjs/common';
import { PageRepository } from './repositories/page.repository';
import { InfoToFindPage, RequiredPageInfo, PageInfoList, PageUserInfo } from './page.type';
import { Page } from 'src/entities/bklog/page.entity';
import { Token } from 'src/utils/base/token.util';
import { Brackets } from 'typeorm';

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
   * @param pageIdList 
   */
  private async deletePage(pageIdList: string[]): Promise<boolean> {
    try {
      await this.pageRepository.delete(pageIdList);

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
  public createPage(requiredPageInfo: RequiredPageInfo): Page {
    const page: Page = this.pageRepository.create(requiredPageInfo);

    page.id = Token.getUUID();

    return page;
  }


  /**
   * 
   * @param id 
   */
  public async getPage(id: string): Promise<Page> {
    const page: Page = await this.pageRepository
      .createQueryBuilder("page")
      .where({ id })
      .leftJoinAndSelect("page.userProfile", "user-profile")
      .leftJoinAndSelect("page.blockList", "block")
      .leftJoinAndSelect("block.property","block-property")
      .getOne();

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
      const result = await this.deletePage([page.id]);

      return result;
    }

    return false;
  }

  /**
   * 
   * @param profileId 
   * @param scope 
   */
  public async findPublicPageList(
    { id, penName }: PageUserInfo, 
    scope:number = 4
  ): Promise<PageInfoList[]> {

    if(id || penName) { 

      const pageList: Page[] = await this.pageRepository
        .createQueryBuilder("page")
        .leftJoinAndSelect(
          "page.userProfile", 
          "user-profile"
        )
        .where("page.disclosureScope >= :scope", { scope: 0 })
        .andWhere(new Brackets(qb => {
          qb.where("user-profile.id = :id", { id })
            .orWhere("user-profile.penName = :penName", { penName })
        }))
        .select([
          "page.id",
          "page.title",
          "page.disclosureScope"
        ])
        .orderBy("page.disclosureScope", "DESC")
        .addOrderBy("page.title", "ASC")
        .getMany();

      if(pageList[0]) {
        return pageList;
      }

    } 

    return null;
  }

}
