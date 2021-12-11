import { Injectable, Logger } from '@nestjs/common';
import { PageRepository } from './repositories/page.repository';
import { InfoToFindPage, RequiredPageInfo, PageInfoList, PageUserInfo } from './page.type';
import { Page } from 'src/entities/bklog/page.entity';
import { Token } from 'src/utils/common/token.util';
import { Brackets, Connection, In, QueryRunner } from 'typeorm';
import { PageVersionRepository } from '../repositories/page-version.repository';
import { PageCommentRepository } from './repositories/page-comment.repository';
import { PageVersion } from 'src/entities/bklog/page-version.entity';
import { PageComment } from 'src/entities/bklog/page-comment.entity';
import { UserProfile } from 'src/entities/user/user-profile.entity';
import { InfoToFindPageVersion, ModifyBklogDataType, ModifyPageInfoType, PageVersions, RequiredPageVersionIdList } from '../bklog.type';
import { AuthErrorMessage, CommonErrorMessage, ComposedResponseErrorType, Response, ResponseError, SystemErrorMessage } from 'src/utils/common/response.util';
import { BklogErrorMessage } from '../utils';

@Injectable()
export class PageService {
  constructor(
    private connection: Connection,
    private readonly pageRepository: PageRepository,
    private readonly pageVersionRepository: PageVersionRepository,
    private readonly pageCommentRepository : PageCommentRepository
  ){}

  /**
   * pageVersion id
   * @param id 
   */
  public async findOnePageVersion(infoToFindPageVersion: InfoToFindPageVersion): Promise<PageVersion> {
    return await this.pageVersionRepository.findOne({
      where: infoToFindPageVersion
    });
  }

  /**
   * 
   * @param page 
   */
  public async findOneCurrentPageVersion(page: Page) {
    return await this.pageVersionRepository.findOne({
      where: {
        page
      },
      order: {
        createdDate: "DESC"
      }
    });
  }

  /**
   * page 정보 찾기
   * @param pageInfo 
   */
  public async findOnePage(pageInfo: InfoToFindPage): Promise<Page> {
    return await this.pageRepository.findOne({
      where: pageInfo
    });
  }

  /**
   * 
   * @param id 
   */
  public async checkCurrentPageVersion(id: string, page: Page): Promise<string | null> {
    const pageVersion: PageVersion = await this.findOneCurrentPageVersion(page);
    console.log("page version", pageVersion, id, page);
    if(!pageVersion || pageVersion.id !== id) {
      return null;
    } 

    return pageVersion.id;
  }

  /**
   * 
   * @param pageInfo 
   */
  public async findPage(pageInfo: InfoToFindPage): Promise<Page[]> {
    return await this.pageRepository.find({
      where: pageInfo
    });
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
   * @param page 
   * @param pageModifyData 
   * @param requiredIdList 
   */
  public createPageVersion(
    page: Page, 
    data: ModifyBklogDataType, 
    requiredIdList?: RequiredPageVersionIdList
  ): PageVersion {
    const pageVersion: PageVersion = this.pageVersionRepository.create({
      page,
      data
    });

    if(requiredIdList) {
      pageVersion.id = requiredIdList.id;
      pageVersion.preVersionId = requiredIdList.preVersionId
    } else {
      pageVersion.id = Token.getUUID();
    }

    return pageVersion;
  }


  /**
   * 
   * @param page 
   */
  public async savePage(page: Page) {
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
   * @param requiredPageInfo 
   */
  public createPage(requiredPageInfo: RequiredPageInfo): Page {
    requiredPageInfo.profileId = undefined;
    const page: Page = this.pageRepository.create(requiredPageInfo);

    page.id = Token.getUUID();

    return page;
  }


  /**
   * scope 추가해야함.
   * @param id 
   */
  public async getPage(id: string): Promise<Page> {
    const page: Page = await this.pageRepository
      .createQueryBuilder("page")
      .where({ id })
      .leftJoinAndSelect("page.userProfile", "user-profile")
      .leftJoinAndSelect("page.blockList", "block")
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

  public checkPage(
    page: Page, 
    userId: string
  ): ComposedResponseErrorType | null {

    if(!page) {
      return BklogErrorMessage.notFound;
    }

    if(page.userId !== userId) {
      return AuthErrorMessage.info;
    }

    if(page.updating) {
      return BklogErrorMessage.updating;
    }

    if(page.editLock) {
      return BklogErrorMessage.editLock;
    }

    return null;
  }

  // /**
  //  * 
  //  * @param profileId 
  //  * @param scope 
  //  */
  // public async findPublicPageList(
  //   { id, penName }: PageUserInfo, 
  //   scope:number = 4
  // ): Promise<PageInfoList[]> {

  //   if(id || penName) { 

  //     const pageList: Page[] = await this.pageRepository
  //       .createQueryBuilder("page")
  //       .leftJoinAndSelect(
  //         "page.userProfile", 
  //         "user-profile"
  //       )
  //       .where("page.disclosureScope >= :scope", { scope })
  //       .andWhere(new Brackets(qb => {
  //         qb.where("user-profile.id = :id", { id })
  //           .orWhere("user-profile.penName = :penName", { penName })
  //       }))
  //       .select([
  //         "page.id",
  //         "page.title",
  //         "page.disclosureScope"
  //       ])
  //       .orderBy("page.disclosureScope", "DESC")
  //       .addOrderBy("page.title", "ASC")
  //       .getMany();

  //     if(pageList[0]) {
  //       return pageList;
  //     }

  //   } 

  //   return null;
  // }

    /**
   * 
   * @param profileId 
   * @param scope 
   */
  public async findPublicPageList(
    { id, penName }: PageUserInfo, 
    reqScope:number = 5,
    skip: number = 0,
    take: number = 50,
  ): Promise<PageInfoList[]> {

    if(id || penName) {
      let scope = reqScope === 0? 5 : reqScope; 

      const pageList: Page[] = await this.pageRepository
        .createQueryBuilder("page")
        .leftJoinAndSelect(
          "page.userProfile", 
          "user-profile"
        )
        .where("page.disclosureScope >= :scope", { scope })
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
        .skip(skip)
        .take(take)
        .getMany();

      if(pageList[0]) {
        return pageList;
      }

    } 

    return null;
  }

  public async removeAllPage(userProfile: UserProfile) {
    const pageIdList: Page[] = await this.pageRepository
      .find({
        where: {
          userProfile
        },
        select: ["id"]
      });

    const pageVersionIdList: PageVersion[] = await this.pageVersionRepository
      .find({
        where: {
          page: In(pageIdList)
        },
        select: ["id"]
      });

    const pageCommentIdList: PageComment[] = await this.pageCommentRepository
      .find({
        where: {
          page: In(pageIdList),
          userProfile
        }
      });
    
  }

  public async updateModfiyPageInfo(
    queryRunner: QueryRunner,
    page: Page,
    modifyPageInfo: ModifyPageInfoType
  ): Promise<null> {
    const updatedPage: Page = Object.assign(page, modifyPageInfo);

    await queryRunner.manager.save(updatedPage);

    return null;
  }

  public async updatePageInfo(
    modifyPageInfo: ModifyPageInfoType,
    pageId: string,
    userId: string
  ): Promise<Response> {
    const page: Page = await this.findOnePage({id: pageId});

    const resCheckPage = this.checkPage(page, userId);

    if(resCheckPage) {
      return new Response().error(...resCheckPage);
    }

    const updatedPage = Object.assign({}, page, modifyPageInfo);

    const result: boolean = await this.savePage(updatedPage);

    return result? new Response().body("success") : new Response().error(...SystemErrorMessage.db);
  }

  public async containerUpdateBklog(
    pageId: string, 
    userId: string, 
    pageVersions: PageVersions,
    data: ModifyBklogDataType,
    callback?: (queryRunner: QueryRunner, page: Page) => Promise<ComposedResponseErrorType | null>
  ): Promise<Response> {

    const page: Page = await this.findOnePage({id: pageId});

    const resCheckPage = this.checkPage(page, userId);

    if(resCheckPage) {
      return new Response().error(...resCheckPage);
    }

    const resCheckCurrentVersion = await this.checkCurrentPageVersion(pageVersions.current, page);

    if(!resCheckCurrentVersion) {
      return new Response().error(...BklogErrorMessage.notFoundVersion);
    }

    page.updating = true;

    await this.savePage(page);

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if(callback) {
        const result = await callback(queryRunner, page);

        if(result) {
          return new Response().error(...result);
        }
      }

      const pageVersion: PageVersion = queryRunner.manager.create(PageVersion, {
        id: pageVersions.next,
        preVersionId: pageVersions.current,
        page,
        data
      });

      await queryRunner.manager.delete(PageVersion, pageVersions.current);

      await queryRunner.manager.save(pageVersion);

      await queryRunner.commitTransaction();

    } catch(e) {
      Logger.error(e);
      await queryRunner.rollbackTransaction();

      return new Response().error(...SystemErrorMessage.db);
    } finally {
      await queryRunner.release();

      page.updating = false;
      page.lastAccessDate = new Date(Date.now());
      page.views = Number(page.views) + 1;

      await this.savePage(page);
    }

    return new Response().body({ pageVersion: pageVersions.next });
  }

}
