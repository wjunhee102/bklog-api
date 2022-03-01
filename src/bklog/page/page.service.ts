import { Injectable, Logger } from '@nestjs/common';
import { PageRepository } from './repositories/page.repository';
import { InfoToFindPage, RequiredPageInfo, PageInfoList, PageUserInfo } from './page.type';
import { Page } from 'src/entities/bklog/page.entity';
import { Token } from 'src/utils/common/token.util';
import { Any, Brackets, Connection, In, QueryRunner } from 'typeorm';
import { PageVersionRepository } from '../repositories/page-version.repository';
import { PageCommentRepository } from './repositories/page-comment.repository';
import { PageVersion } from 'src/entities/bklog/page-version.entity';
import { PageComment } from 'src/entities/bklog/page-comment.entity';
import { UserProfile } from 'src/entities/user/user-profile.entity';
import { InfoToFindPageVersion, ModifyBklogData, PageInfoProps, PageVersions, RequiredPageVersionIdList } from '../bklog.type';
import { ComposedResponseErrorType, Response, SystemErrorMessage } from 'src/utils/common/response.util';
import { BklogErrorMessage } from '../utils';
import { PageEditorRepository } from './repositories/page-editor.repository';
import { PageEditor } from 'src/entities/bklog/page-editor.entity';
import { Block } from 'src/entities/bklog/block.entity';
import { BlockComment } from 'src/entities/bklog/block-comment.entity';
import { PageStar } from 'src/entities/bklog/page-star.entity';
import { LogError } from 'src/common/decorator';
@Injectable()
export class PageService {
  constructor(
    private connection: Connection,
    private readonly pageRepository: PageRepository,
    private readonly pageVersionRepository: PageVersionRepository,
    private readonly pageCommentRepository : PageCommentRepository,
    private readonly pageEditorRespository: PageEditorRepository
  ){}

  private async logError(callback: Function) {
    try {
      await callback();

      return true;
    } catch(e) {
      return false;
    }
  }

  // create

  /**
   * 
   * @param requiredPageInfo 
   */
  public createPage(requiredPageInfo: RequiredPageInfo): Page {
    const page = this.pageRepository.create(Object.assign({}, requiredPageInfo, {
      profileId: undefined
    }) as RequiredPageInfo);

    page.id = Token.getUUID();

    return page;
  }


  /**
   * 
   * @param page 
   * @param pageModifyData 
   * @param requiredIdList 
   */
  public createPageVersion(
    page: Page, 
    data: ModifyBklogData, 
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
   * @param userProfile 
   */
  public createPageEditor(
    page: Page,
    userProfile: UserProfile,
    authority: number = 2
  ) {
    const pageEditor: PageEditor = this.pageEditorRespository.create({
      page,
      userProfile,
      authority
    });

    return pageEditor;
  }

  /**
   * 
   * @param requiredPageInfo 
   * @param data 
   */
  public preCreateBklog(
    requiredPageInfo: RequiredPageInfo, 
    data: ModifyBklogData,  
  ): [Page, PageVersion, PageEditor] {
    const page: Page = this.createPage(requiredPageInfo);
    const pageVersion: PageVersion = this.createPageVersion(page, data);
    const pageEditor: PageEditor = this.createPageEditor(page, requiredPageInfo.userProfile, 0);

    return [page, pageVersion, pageEditor];
  }

  // find

  /**
   * pageVersion id
   * @param id 
   */
  public async findOnePageVersion(infoToFindPageVersion: InfoToFindPageVersion): Promise<PageVersion | undefined> {
    return this.pageVersionRepository.findOne({
      where: infoToFindPageVersion
    });
  }

  public async findPageVeriosn(page: Page): Promise<PageVersion[]> {
    return this.pageVersionRepository.find({
      where: {
        page
      },
      order: {
        createdDate: "DESC"
      }
    });
  }

  /**
   * 
   * @param page 
   */
  public async findOneCurrentPageVersion(id: string) {
    return this.pageVersionRepository.findOne({
      where: {
        page: {
          id
        }
      },
      order: {
        createdDate: "DESC"
      }
    });
  }
  
  /**
   * 
   * @param infoToFindEditor 
   */
  public async findOnePageEditor(pageId: string, profileId: string) {
    return this.pageEditorRespository.findOne({
      where: {
        page: {
          id: pageId
        },
        userProfile: {
          id: profileId
        }
      }
    });
  }

  /**
   * page 정보 찾기
   * @param pageInfo 
   */
  public async findOnePage(pageInfo: InfoToFindPage) {
    return await this.pageRepository.findOne({
      where: pageInfo
    });
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

  // save

  /**
   * 
   * @param pageEditor 
   */
  public async savePageEditor(pageEditor: PageEditor) {
    try {
      await this.pageEditorRespository.save(pageEditor);

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
  public async savePage(page: Page) {
    try {
      await this.pageRepository.save(page);

      return true;
    } catch(e) {
      Logger.error(e);

      return false;
    }
  }

  // delete

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
   * @param versionIdList 
   */
  private async deletePageVersion(versionIdList: string[]): Promise<boolean> {
    try {
      await this.pageVersionRepository.delete(versionIdList);

      return true;
    } catch(e) {
      Logger.error(e);

      return false;
    }
  }

  private async deletePageComment(commentIdList: string[]): Promise<boolean> {
    try {
      await this.pageCommentRepository.delete(commentIdList);

      return true;
    } catch(e) {
      Logger.error(e);

      return false;
    }
  }

  /**
   * 
   * @param pageEditorIdList 
   */
  private async deletePageEditor(pageEditorIdList: number[] | string[]): Promise<boolean> {
    try {
      await this.pageEditorRespository.delete(pageEditorIdList);

      return true;
    } catch(e) {
      Logger.error(e);

      return false;
    }
  }

  // check

  /**
   * 
   * @param page 
   * @param userId 
   */
  public checkPage(
    page: Page
  ): ComposedResponseErrorType | null {

    if(!page) {
      return BklogErrorMessage.notFound;
    }

    if(page.updating) {
      return BklogErrorMessage.updating;
    }

    if(page.editLock) {
      return BklogErrorMessage.editLock;
    }

    return null;
  }

  /**
   * 
   * @param id 
   */
  public async checkCurrentPageVersion(id: string, pageId: string): Promise<string | null> {
    const pageVersion = await this.findOneCurrentPageVersion(pageId);

    if(!pageVersion || pageVersion.id !== id) {
      return null;
    } 

    return pageVersion.id;
  }

  /**
   * 
   * @param pageId 
   * @param profileId 
   */
  public async checkPageEditor(pageId: string, profileId: string, authorized: number = 2): Promise<ComposedResponseErrorType | null> {
    const pageEditor = await this.findOnePageEditor(pageId, profileId);

    if(pageEditor && pageEditor.authority <= authorized) return null;

    return BklogErrorMessage.authorized;
  }

  /**
   * scope 추가해야함.
   * @param id 
   */
  public async getPage(id: string): Promise<Page | null> {
    try {
      const page: Page | undefined = await this.pageRepository
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
    } catch(e) {
      Logger.error(e);

      return null;
    }
  }

  public async removePageVersion({
    page, 
    saveCount = 5, 
    pageVersionList
  }: {
    page?: Page;
    saveCount?: number;
    pageVersionList?: PageVersion[];
  }): Promise<ComposedResponseErrorType | null> {
    if(!page) return null;

    let targetPageVersionList = pageVersionList? pageVersionList : await this.findPageVeriosn(page);

    if(targetPageVersionList.length < saveCount + 1) {
      Logger.log("not page version");
      return null;
    }

    const deleteList = targetPageVersionList.slice(saveCount).map(version => version.id);

    return await this.deletePageVersion(deleteList)? null : SystemErrorMessage.db;
  }

  public async removePageEditor(pageId: string, userProfileId: string): Promise<ComposedResponseErrorType | null> {
    const pageEditor = await this.findOnePageEditor(pageId, userProfileId);

    if(!pageEditor) return BklogErrorMessage.notFound;

    return await this.deletePageEditor([pageEditor.id])? 
      null : SystemErrorMessage.db;
  }

  public async removePage(pageId: string): Promise<ComposedResponseErrorType | null> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const page = await this.pageRepository.findOne({
        where: {
          id: pageId
        },
        relations: ["versionList", "pageStar", "pageComments", "blockList", "blockComments", "editorList"]
      });

      if(!page) return BklogErrorMessage.notFound;

      if(page.blockCommentList[0]) await queryRunner.manager.delete(BlockComment, page.blockCommentList.map(com => com.id));

      if(page.blockList[0]) await queryRunner.manager.delete(Block, page.blockList.map(block => block.id));

      if(page.editorList[0]) await queryRunner.manager.delete(PageEditor, page.editorList.map(edi => edi.id));

      if(page.versionList[0]) await queryRunner.manager.delete(PageVersion, page.versionList.map(ver => ver.id));

      if(page.pageStar[0]) await queryRunner.manager.delete(PageStar, page.pageStar.map(star => star.id));

      if(page.pageCommentList[0]) await queryRunner.manager.delete(PageComment, page.pageCommentList.map(com => com.id));

      await queryRunner.manager.delete(Page, pageId);

      await queryRunner.commitTransaction();

      return null;
    } catch(e) {
      Logger.error(e);
      await queryRunner.rollbackTransaction();

      return SystemErrorMessage.db;
    } finally {
      queryRunner.release();
    }

  }

  /**
   * 
   * @param queryRunner 
   * @param userProfile 
   */
  public async removeAllPage(queryRunner: QueryRunner, userProfile: UserProfile): Promise<null> {
    const pageList = await queryRunner.manager
      .find(Page, {
        where: {
          userProfile
        },
        select: ["id"]
      });

    if(!pageList[0]) throw new Error("not found Page");

    const pageIdList = pageList.map(page => page.id);

    const pageVersionIdList = await queryRunner.manager
      .find(PageVersion, {
        where: {
          page: {
            id: In(pageIdList)
          }
        },
        select: ["id"]
      });

    const pageCommentIdList = await queryRunner.manager
      .find(PageComment, {
        where: [
          {page: {
            id: In(pageIdList)
          }},
          {userProfile}
        ],
        select: ["id"]
      });

    const pageEditorIdList = await queryRunner.manager
      .find(PageEditor, {
        where: [
          {page: {
            id: In(pageIdList)
          }},
          {userProfile}
        ]
      });

    const pageStarList = await queryRunner.manager
      .find(PageStar, {
        where: [
          {page: {
            id: In(pageIdList)
          }},
          {userProfile}
        ],
        select: ["id"]
      });

    const blockList = await queryRunner.manager
      .find(Block, {
        where: {
          page: {
            id: In(pageList.map(page => page.id))
          } 
        },
        select: ["id"]
      });

    console.log(blockList);

    if(blockList[0]) {
      console.log(blockList);
      const blockCommentList = await queryRunner.manager
        .find(BlockComment, {
          where: [
            {page: {
              id: In(pageIdList)
            }},
            {userProfile}
          ],
          select: ["id"]
        });
    
      if(blockCommentList[0]) await queryRunner.manager.delete(BlockComment, blockCommentList.map(com => com.id));

      await queryRunner.manager.delete(Block, blockList.map(block => block.id));
    }
    
    if(pageVersionIdList[0]) await queryRunner.manager.delete(PageVersion, pageVersionIdList.map(version => version.id));
    if(pageCommentIdList[0]) await queryRunner.manager.delete(PageComment, pageCommentIdList.map(com => com.id));
    if(pageEditorIdList[0]) await queryRunner.manager.delete(PageEditor, pageEditorIdList.map(edi => edi.id));
    if(pageStarList[0]) await queryRunner.manager.delete(PageStar, pageStarList.map(star => star.id));

    await queryRunner.manager.delete(Page, pageList.map(page => page.id));

    return null;
  }

  // update

  public async updateModfiyPageInfo(
    queryRunner: QueryRunner,
    page: Page,
    modifyPageInfo: PageInfoProps
  ): Promise<null> {
    const updatedPage = Object.assign(page, modifyPageInfo);

    await queryRunner.manager.save(updatedPage);

    return null;
  }

  public async updatePageInfo(
    modifyPageInfo: PageInfoProps,
    pageId: string,
    userId: string,
    profileId?: string
  ): Promise<Response> {
    const page = await this.findOnePage({id: pageId});

    if(!page) return new Response().error(...BklogErrorMessage.notFound);

    const resCheckPage = this.checkPage(page);

    if(resCheckPage) return new Response().error(...resCheckPage);

    if(page.userId !== userId) {
      if(profileId) {
        const checkPageEditor = await this.checkPageEditor(pageId, profileId, 1);

        if(checkPageEditor) return new Response().error(...checkPageEditor);

      } else {
        return new Response().error(...BklogErrorMessage.authorized);
      }
      
    }

    const updatedPage = Object.assign({}, page, modifyPageInfo);

    const result: boolean = await this.savePage(updatedPage);

    return result? new Response().body("success") : new Response().error(...SystemErrorMessage.db);
  }

  /**
   * 
   * @param pageId 
   * @param profileId 
   * @param pageVersions 
   * @param data 
   * @param callback 
   */
  public async containerUpdateBklog(
    pageId: string, 
    userId: string,
    profileId: string, 
    pageVersions: PageVersions,
    data: ModifyBklogData,
    callback?: (queryRunner: QueryRunner, page: Page) => Promise<ComposedResponseErrorType | null>
  ): Promise<Response> {
    console.log(pageVersions);
    const page = await this.findOnePage({id: pageId});

    if(!page) return new Response().error(...BklogErrorMessage.notFound);

    const resCheckPage = this.checkPage(page);

    if(resCheckPage) return new Response().error(...resCheckPage);

    if(page.userId !== userId) {
      const resCheckEditor = await this.checkPageEditor(page.id, profileId, page.editableScope === 0? 0 : 2);

      if(resCheckEditor) return new Response().error(...resCheckEditor);
    } 

    const resCheckCurrentVersion = await this.checkCurrentPageVersion(pageVersions.current, page.id);

    if(!resCheckCurrentVersion) return new Response().error(...BklogErrorMessage.notFoundVersion);

    page.updating = true;

    await this.savePage(page);

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if(callback) {
        const result = await callback(queryRunner, page);

        if(result) return new Response().error(...result);
      }

      const pageVersion: PageVersion = queryRunner.manager.create(PageVersion, {
        id: pageVersions.next,
        preVersionId: pageVersions.current,
        page,
        data
      });

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

    return new Response().body({ pageVersion: pageVersions.next }).status(200);
  }

  // provide

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
  ): Promise<PageInfoList[] | null> {
    if(!id && !penName) return null;

    let scope = reqScope === 0? 5 : reqScope; 

    const pageList = await this.pageRepository
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
        "page.disclosureScope",
        "page.emoji",
        "page.parentPageId"
      ])
      .orderBy("page.disclosureScope", "DESC")
      .addOrderBy("page.title", "ASC")
      .skip(skip)
      .take(take)
      .getMany();

    console.log("pagelist", pageList);

    return pageList[0]? pageList : null;
  }
}
