import { Injectable, Logger } from '@nestjs/common';
import { RequiredPageInfo, PageInfoList, RequiredBklogInfo } from './page/page.type';
import { PageService } from './page/page.service';
import { BlockService } from './block/block.service';
import { BlockData, UnionBlockData } from './block/type';
import { UserService } from 'src/user/user.service';
import { PageStarRepository } from './page/repositories/page-star.repository';
import { Page } from 'src/entities/bklog/page.entity';
import { ParamGetPageList, PageVersions, ResUpdateBklog, PageInfo, PageInfoProps, ModifyBklogData } from './bklog.type';
import { Connection, QueryRunner } from 'typeorm';
import { Response, SystemErrorMessage, AuthErrorMessage, CommonErrorMessage, ComposedResponseErrorType, ResponseErrorTypes } from 'src/utils/common/response.util';
import { AuthService } from 'src/auth/auth.service';
import { BklogErrorMessage } from './utils';
import { PageEditor } from 'src/entities/bklog/page-editor.entity';
import { Token } from 'src/utils/common/token.util';

@Injectable()
export class BklogService {
  constructor(
    private connection: Connection,
    private readonly pageService: PageService,
    private readonly blockService: BlockService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly pageStarRepository: PageStarRepository
  ){}

  /**
   * 
   * @param profileId 
   * @param pageId 
   */
  private async insertPageStar(profileId: string, pageId: string): Promise<boolean> {
    try {
      const userProfile = await this.userService.findOneUserProfile({ id: profileId });
      
      if(!userProfile) return false;
      
      const page = await this.pageService.getPage(pageId);
      
      if(!page) return false;

      const pageStar = await this.pageStarRepository.create({
        userProfile,
        page
      });

      await this.pageStarRepository.save(pageStar);

      return true;
    } catch(e) {
      Logger.error(e);

      return false;
    }
  }

  private async insertPageComment() {
    
  }
 

  // Page editor

   /**
   * 
   * @param pageId 
   * @param profileId 
   * @param targetProfileId 
   * @param callback 
   */
  public async containerEditPageEditor(
    pageId: string, 
    profileId: string, 
    targetProfileId: string, 
    callback: (pageId: string, profileId: string) => Promise<Response>
  ): Promise<Response> {
    const resultCheck = await this.pageService.checkPageEditor(pageId, profileId, 1);

    if(resultCheck) return new Response().error(...resultCheck);

    return await callback(pageId, targetProfileId);
  }

  /**
   * 
   * @param pageId 
   * @param profileId 
   */
  public async addPageEditor(pageId: string, profileId: string): Promise<Response<string>> {
    const page = await this.pageService.findOnePage({ id: pageId });

    if(!page) return new Response().error(...BklogErrorMessage.notFound);

    const userProfile = await this.userService.findOneUserProfile({ id: profileId });

    if(!userProfile) return new Response().error(...BklogErrorMessage.notFound);

    const prePageEditor: PageEditor | undefined = await this.pageService.findOnePageEditor(page.id, userProfile.id);

    if(prePageEditor) return new Response().error(
        new BklogErrorMessage()
        .preBuild(
          "list안에 존재합니다.",
          "Exists on the list of editors",
          "006"
        ));
    

    const pageEditor = await this.pageService.createPageEditor(page, userProfile);

    const result = await this.pageService.savePageEditor(pageEditor);

    if(!result) return new Response().error(...SystemErrorMessage.db);

    return new Response().body("success").status(201);
  }

  /**
   * 
   * @param pageId 
   * @param profileId 
   */
  public async excludeFromPageEditorlist(pageId: string, profileId: string): Promise<Response> {
    const result = await this.pageService.removePageEditor(pageId, profileId);

    if(result) return new Response().error(...result);

    return new Response().body("success");
  }

  // Page

  /**
   * 
   * @param requiredBklogInfo 
   */
  public async createBklog(requiredBklogInfo: RequiredBklogInfo): Promise<Response> {

    const userProfile = await this.userService.findOneUserProfile({ id: requiredBklogInfo.profileId });

    if(!userProfile) return new Response().error(...AuthErrorMessage.info);
    
    const requiredPageInfo: RequiredPageInfo = Object.assign(requiredBklogInfo, {
      userProfile
    });

    const page = this.pageService.createPage(requiredPageInfo);

    const block = this.blockService.createBlockData(page);

    const blockData: BlockData = Object.assign({}, block, {
      blockComment: undefined, 
      page: undefined
    });

    const pageVersion = this.pageService.createPageVersion(page, {
        blockData: {
          create: [
            {
              id: block.id,
              type: block.type,
              payload: blockData
            }
          ]
        }
      }
    );

    const pageEditor = this.pageService.createPageEditor(page, userProfile, 0);

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(page);
      await queryRunner.manager.save(block);
      await queryRunner.manager.save(pageVersion);
      await queryRunner.manager.save(pageEditor);

      await queryRunner.commitTransaction();

    } catch(e) {

      Logger.error(e);
      await queryRunner.rollbackTransaction();

      return new Response().error(...SystemErrorMessage.db);

    } finally {
      await queryRunner.release();
    }

    return new Response().body(page.id).status(201);
  }


  /**
   * 
   * @param factorGetPageList 
   */
  public async findPageList(factorGetPageList: ParamGetPageList, userId?: string): Promise<Response> {
    let scope = 5;

    const userProfile = await this.userService.findOneUserProfile(factorGetPageList.pageUserInfo);
    
    if(!userProfile) return new Response().error(...CommonErrorMessage.notFound).notFound();

    if(factorGetPageList.reqProfileId && userId) {
      // id가 해당 유저의 팔로워인지... 맞으면 scope에 대입.
      const reqProfileId = factorGetPageList.reqProfileId;

      const checkProfileId = await this.authService.checkUserIdNProfileId(userId, reqProfileId);

      if(!checkProfileId) return new Response().error(...AuthErrorMessage.info).unauthorized();

      if(reqProfileId === userProfile.id) scope = 1;
      
    }
    
    const pageInfoList: PageInfoList[] | null = await 
      this.pageService.findPublicPageList(
        factorGetPageList.pageUserInfo, 
        scope,
        factorGetPageList.skip,
        factorGetPageList.take
      ); 

    return pageInfoList? 
      new Response().body({ pageInfoList, userProfile }) 
      : new Response().error(...CommonErrorMessage.notFound).notFound();
  }

  public async getPage(pageId: string, profileId?: string | null): Promise<Response<{
    pageInfo: PageInfo;
    blockList: UnionBlockData[];
    version: string;
  } | { error: ResponseErrorTypes }>> {
    const page = await this.pageService.getPage(pageId);

    if(!page) return new Response().error(...BklogErrorMessage.notFound)

    const pageVersionList = await this.pageService.findPageVeriosn(page);

    if(!pageVersionList[0]) return new Response().error(...BklogErrorMessage.notFoundVersion)

    const pageVersion = pageVersionList[0];

    const result = await this.pageService.removePageVersion({ pageVersionList, saveCount: 5 });
    
    let editable = false;

    if(result) return new Response().error(...result);

    /**
     * scope 확인?
     */
    if(profileId) {

      if(profileId === page.userProfile.id) {
        editable = true;
      } else {
        const disclosureScope = page.disclosureScope;
        const editableScope   = page.editableScope;
      }

    }
    
    return new Response<{
      pageInfo: PageInfo;
      blockList: UnionBlockData[];
      version: string;
    } >().body({
      pageInfo: Object.assign({}, page, {
        versionList: undefined,
        blockList: undefined,
        userProfile: undefined,
        profileId: page.userProfile.id,
        userId: undefined,
        editable,
        removedDate: undefined,
        updating: undefined
      }),
      blockList: page.blockList.map((block) => {
        return Object.assign({}, block, {
          page: undefined,
          blockComment: undefined,
        })
      }),
      version: pageVersion.id
    });
  }

  /**
   * 
   * @param modifyPageInfo 
   * @param pageId 
   * @param userId 
   */
  public async updatePageInfo2(
    modifyPageInfo: PageInfoProps,
    pageId: string,
    userId: string,
    profileId: string
  ): Promise<Response> {
    return this.pageService.updatePageInfo(modifyPageInfo, pageId, userId, profileId);
  }

  public async updatePageInfo(
    modifyPageInfo: PageInfoProps,
    pageId: string,
    userId: string,
    profileId: string
  ): Promise<Response> {
    const pageVersion = await this.pageService.findOneCurrentPageVersion(pageId);

    if(!pageVersion) return new Response().error(...BklogErrorMessage.notFoundVersion);

    return this.pageService.containerUpdateBklog(
      pageId, 
      userId, 
      profileId, 
      {
        current: pageVersion.id,
        next: Token.getUUID()
      }, 
      { pageInfo: modifyPageInfo },
      this.callbackUpdatePageInfo(modifyPageInfo)  
    );
  }

  // Bklog

   /**
   * 
   * @param id 
   * @param preVersionId 
   */
  public async getModifyData(id: string, preVersionId: string): Promise<Response> {
    console.log("getModify", id, preVersionId);
    if(id === preVersionId) {
      return new Response().body({ id: id, data: {}});
    }
    const pageVersion = await this.pageService.findOnePageVersion({ id, preVersionId });

    return pageVersion? new Response().body({ id: pageVersion.id, data: pageVersion.data })
    : new Response().error(...BklogErrorMessage.notFoundVersion);
  }

  /**
   * 
   * @param id pageId
   */
  public async releaseUpdating(
    pageId: string,
    userId: string
  ): Promise<Response> {
    const page = await this.pageService.getPage(pageId);

    if(!page) {
      return new Response().error(...BklogErrorMessage.notFound);
    }

    if(page.userId !== userId) {
      return new Response().error(...AuthErrorMessage.info);
    }

    

    if(page.updating) {
      page.updating = false;
      await this.pageService.savePage(page);
    }

    return new Response().body("success"); 
  }

  private callbackUpdatePageInfo(modifyPageInfo: PageInfoProps) {
    return async (queryRunner: QueryRunner, page: Page): Promise<null> => {
      return await this.pageService.updateModfiyPageInfo(queryRunner, page, modifyPageInfo);
    }
  }

   /**
    * 
    * @param ModifyBklogDataType
    */
  private callbackUpdateBklog({ 
    pageInfo,
    blockData
  }: ModifyBklogData) {
    return async (queryRunner: QueryRunner, page: Page): Promise<ComposedResponseErrorType | null> => {
      if(pageInfo) {
        await this.pageService.updateModfiyPageInfo(queryRunner, page, pageInfo);
      }
  
      if(blockData) {
        const resultUpdateBlock = await this.blockService.updateModifyBlockData(queryRunner, page, blockData);
  
        if(resultUpdateBlock) {
          await queryRunner.rollbackTransaction();
  
          return resultUpdateBlock;
        }
  
      }
      return null;
    }  
    
  }

  /**
   * 
   * @param ModifyBklogDataType
   * @param pageId 
   * @param userId 
   * @param pageVersions 
   */
  public async updateBklog(
    modifyBklogData: ModifyBklogData, 
    pageId: string, 
    userId: string, 
    profileId: string,
    pageVersions: PageVersions
  ): Promise<Response<ResUpdateBklog | ResponseErrorTypes>> {
    console.log("modifyBklogData", modifyBklogData);
    return await this.pageService.containerUpdateBklog(
      pageId, 
      userId, 
      profileId,
      pageVersions, 
      modifyBklogData,
      this.callbackUpdateBklog(modifyBklogData)
    )
  }

  public async testRemovePage(pageId: string): Promise<Response> {
    const result = await this.pageService.removePage(pageId);

    return result? new Response().error(...result) : new Response().body("success");
  }

  /**
   * 
   * @param pageId 
   * @param userId 
   * @param profileId 
   */
  public async deletePage(
    pageId: string, 
    userId: string, 
    profileId: string
  ): Promise<Response> {
    const page = await this.pageService.findOnePage({ id: pageId });

    if(!page) return new Response().error(...BklogErrorMessage.notFound);

    if(page.userId !== userId) {
      const resultCheckEditor = await this.pageService.checkPageEditor(pageId, profileId, page.editableScope);

      if(resultCheckEditor) return new Response().error(...BklogErrorMessage.authorized);
    }

    const result = await this.pageService.removePage(pageId);

    return result? new Response().error(...result) : new Response().body("success");
  }

}
