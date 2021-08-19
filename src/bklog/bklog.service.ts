import { Injectable, Logger } from '@nestjs/common';
import { RequiredPageInfo, PageInfoList, RequiredBklogInfo } from './page/page.type';
import { PageService } from './page/page.service';
import { BlockService } from './block/block.service';
import { BlockData, ModifyData } from './block/block.type';
import { UserService } from 'src/user/user.service';
import { UserProfile } from 'src/entities/user/user-profile.entity';
import { PageStarRepository } from './page/repositories/page-star.repository';
import { PageCommentRepository } from './page/repositories/page-comment.repository';
import { BlockCommentRepository } from './block/repositories/block-comment.repository';
import { Page } from 'src/entities/bklog/page.entity';
import { PageStar } from 'src/entities/bklog/page-star.entity';
import { PageVersion } from 'src/entities/bklog/page-version.entity';
import { PageVersionRepository } from './repositories/page-version.repository';
import { InfoToFindPageVersion, ParamGetPageList, ModifyBlockType, ModifySet, PageVersions, ResModifyBlock, RequiredPageVersionIdList, ResCreateBklog, PageModifyDateType } from './bklog.type';
import { Connection } from 'typeorm';
import { BlockComment } from 'src/entities/bklog/block-comment.entity';
import { Block } from 'src/entities/bklog/block.entity';
import { TestRepository } from './block/repositories/test.repositoty';
import { Test } from 'src/entities/bklog/test.entity';
import { Test2 } from 'src/entities/bklog/test2.entity';
import { Test2Respository } from './block/repositories/test2.repository';
import { Response, ResponseError, SystemErrorMessage, AuthErrorMessage, CommonErrorMessage } from 'src/utils/common/response.util';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class BklogService {
  constructor(
    private connection: Connection,
    private readonly pageService: PageService,
    private readonly blockService: BlockService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly pageVersionRepository: PageVersionRepository,
    private readonly pageStarRepository: PageStarRepository,
    private readonly pageCommentRepository: PageCommentRepository,
    private readonly blockCommentRepository: BlockCommentRepository,
    private readonly testRepository: TestRepository,
    private readonly test2Repository: Test2Respository,
  ){}

  /**
   * pageVersion id
   * @param id 
   */
  private async findOnePageVersion(infoToFindPageVersion: InfoToFindPageVersion): Promise<PageVersion> {
    return await this.pageVersionRepository.findOne({
      where: infoToFindPageVersion
    });
  }

  /**
   * 
   * @param page 
   */
  private async findOneCurrentPageVersion(page: Page) {
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
   * 나중에 수정해야함 삼항식
   * @param page 
   */
  // private async insertPageVersion(page: Page, modifyDataList: ModifyBlockType, RequiredIdList?: RequiredPageVersionIdList): Promise<PageVersion> {
  //   const pageVersion: PageVersion = this.pageVersionRepository.create({
  //     id: RequiredIdList? (RequiredIdList.id? RequiredIdList.id : Token.getUUID()) : Token.getUUID(),
  //     preVersionId: RequiredIdList? RequiredIdList.preVersionId? RequiredIdList.preVersionId : null : null,
  //     page,
  //     modifyDataList
  //   });

  //   await this.pageVersionRepository.save(pageVersion);

  //   return await this.findOnePageVersion({ id: pageVersion.id });
  // }

  /**
   * 
   * @param profileId 
   * @param pageId 
   */
  private async insertPageStar(profileId: string, pageId: string): Promise<boolean> {
    try {
      const userProfile: UserProfile = await this.userService.findOneUserProfile({ id: profileId });
      if(!userProfile) {
        return false;
      }
      const page: Page = await this.pageService.getPage(pageId);
      if(!page) {
        return false;
      }

      const pageStar: PageStar = await this.pageStarRepository.create({
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

  /**
   * 
   * @param id 
   */
  private async checkCurrentPageVersion(id: string, page: Page): Promise<{
    success: boolean,
    pageVersion: string
  }> {
    const pageVersion: PageVersion = await this.findOneCurrentPageVersion(page);

    if(!pageVersion || pageVersion.id !== id) {
      return {
        success: false,
        pageVersion: null
      };
    } 

    return {
      success: true,
      pageVersion: pageVersion.id
    };
  }

  private async insertPageComment() {
    
  }

  /**
   * 
   * @param requiredBklogInfo 
   */
  public async createBklog(requiredBklogInfo: RequiredBklogInfo): Promise<Response> {

    const userProfile: UserProfile | null = await this.userService.findOneUserProfile({ id: requiredBklogInfo.profileId});

    if(!userProfile) {
      return new Response().error(...AuthErrorMessage.info);
    }
    
    const requiredPageInfo: RequiredPageInfo = Object.assign(requiredBklogInfo, {
      userProfile
    });

    const page: Page = this.pageService.createPage(requiredPageInfo);

    const block: Block = this.blockService.createBlockData(page);

    const blockData: BlockData = Object.assign({}, block, {
      blockComment: undefined, 
      page: undefined
    });

    const pageVersion: PageVersion = this.pageService.createPageVersion(page, {
        modifyData: {
          create: [
            {
              blockId: block.id,
              set: "block",
              payload: blockData
            }
          ]
        }
      }
    );

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(page);
      await queryRunner.manager.save(block);
      await queryRunner.manager.save(pageVersion);

      await queryRunner.commitTransaction();

    } catch(e) {

      Logger.error(e);
      await queryRunner.rollbackTransaction();

      return new Response().error(...SystemErrorMessage.db);

    } finally {
      await queryRunner.release();
    }

    return new Response().body({ pageId: page.id }).status(201);
  }


  /**
   * 
   * @param factorGetPageList 
   */
  public async findPageList(factorGetPageList: ParamGetPageList, uuid?: string): Promise<Response> {
    let scope = 5;

    const userProfile: UserProfile = await this.userService.findOneUserProfile(factorGetPageList.pageUserInfo);
    
    if(!userProfile) return new Response().error(...CommonErrorMessage.notFound).notFound();

    if(factorGetPageList.reqProfileId && uuid) {
      // id가 해당 유저의 팔로워인지... 맞으면 scope에 대입.
      const checkProfileId = await this.authService.checkUserIdNProfileId(uuid, factorGetPageList.reqProfileId);

      if(!checkProfileId) {
        return new Response().error(...AuthErrorMessage.info).unauthorized();
      }
      
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

  public async getPage(pageId: string, userId?: string | null): Promise<Response> {
    const rawPage: Page | null = await this.pageService.getPage(pageId);
    const pageVersion: PageVersion = await this.findOneCurrentPageVersion(rawPage);

    /**
     * scope 확인?
     */

    const page = rawPage ? {
      pageInfo: Object.assign({}, rawPage, {
        blockList: undefined,
        userProfile: undefined,
        profileId: rawPage.userProfile.id,
        userId: undefined,
        editable: userId? userId === rawPage.userId : false,
        removedDate: undefined,
        updating: undefined
      }),
      blockList: rawPage.blockList.map((block) => {
        return Object.assign({}, block, {
          page: undefined,
          blockComment: undefined,
        })
      }),
      version: pageVersion.id
    } : null;
    
    return page? new Response().body(page) 
      : new Response()
        .error(
          new ResponseError()
          .build(
            "페이지를 찾을 수 없습니다.",
            "The page does not exist or you entered an invalid page id.",
            "001",
            "Bklog"
          )
        ).notFound();
  }

  /**
   * 
   * @param id 
   * @param preVersionId 
   */
  public async getModifyData(id: string, preVersionId: string): Promise<Response> {
    const pageVersion: PageVersion = await this.findOnePageVersion({ id, preVersionId });

    return pageVersion? new Response().body({ id: pageVersion.id, data: pageVersion.pageModifyData })
    : new Response().error(
      new ResponseError()
      .build(
        "버전을 찾을 수 없습니다. 새로 업데이트 해주세요.",
        "No version found",
        "002",
        "Bklog"
      )
    ).notFound();
  }

  /**
   * 
   * @param id pageId
   */
  public async releaseUpdating(
    pageId: string,
    userId: string
  ): Promise<Response> {
    const page: Page = await this.pageService.getPage(pageId);

    if(!page) {
      return new Response()
        .error(
          new ResponseError()
          .build(
            "페이지를 찾을 수 없습니다.",
            "The page does not exist or you entered an invalid page id.",
            "001",
            "Bklog"
          ).get()
        ).notFound();
    }

    if(page.userId !== userId) {
      console.log("error", userId, page.userId);
      return new Response().error(...AuthErrorMessage.info).forbidden();
    }

    

    if(page.updating) {
      page.updating = false;
      await this.pageService.savePage(page);
    }

    return new Response().body("success"); 
  }

  /**
   * 
   * @param modifyBlockDataList 
   * @param pageId 
   * @param userId 
   * @param pageVersions 
   */
  public async modifyBlock(
    modifyBlockDataList: ModifyBlockType, 
    pageId: string, 
    userId: string, 
    pageVersions: PageVersions
  ): Promise<Response> {

    const page: Page = await this.pageService.findOnePage({id: pageId});

    if(!page) {
      return new Response()
        .error(
          new ResponseError()
          .build(
            "페이지를 찾을 수 없습니다.",
            "The page does not exist or you entered an invalid page id.",
            "001",
            "Bklog"
          ).get()
        ).notFound();
    }

    if(page.userId !== userId) {
      return new Response().error(...AuthErrorMessage.info).forbidden();
    }

    if(page.updating) {
      return new Response()
        .error(
          new ResponseError()
          .build(
            "현재 수정중입니다.",
            "The page is being edited, so please send your request again after a while.",
            "003",
            "Bklog"
          ).get()
        ).badReq();
    }

    if(page.editLock) {
      return new Response()
        .error(
          new ResponseError()
          .build(
            "수정할 수 없는 페이지입니다.",
            "This page has an edit_lock enabled.",
            "004",
            "Bklog"
          ).get()
        ).notFound();
    }

    const resCheckCurrentVersion = await this.checkCurrentPageVersion(pageVersions.current, page);

    if(!resCheckCurrentVersion) {
      return new Response()
        .error(
          new ResponseError().build(
            "최신 버전이 아닙니다.",
            "Not the current version",
            "004",
            "Bklog"
          ).get()
        ).badReq();
    }

    page.updating = true;

    await this.pageService.savePage(page);

    const modifyData: ModifyData = {
      block: [],
      comment: []
    }

    if(modifyBlockDataList.create) {
      const resCreate: ModifyData | null = await this.blockService.createData(modifyBlockDataList.create, page);

      if(!resCreate) {
        return new Response().error(
          new ResponseError().build(
            "client error",
            "create param error",
            "004",
            "Bklog"
          ).get()
        ).badReq();
      }

      if(resCreate.block) {
        modifyData.block = modifyData.block.concat(resCreate.block);
      }

      if(resCreate.comment) {
        modifyData.comment = modifyData.comment.concat(resCreate.comment);
      }
    }

    if(modifyBlockDataList.update) {
      const resUpdate: ModifyData | null = await this.blockService.updateData(modifyBlockDataList.update);

      if(!resUpdate) {
        return new Response().error(
          new ResponseError().build(
            "client error",
            "update param error",
            "004",
            "Bklog"
          ).get()
        ).badReq();
      }

      if(resUpdate.block) {
        modifyData.block = modifyData.block.concat(resUpdate.block);
      }

      if(resUpdate.comment) {
        modifyData.comment = modifyData.comment.concat(resUpdate.comment);
      }
    }

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if(modifyData.block[0]) await queryRunner.manager.save(modifyData.block);
      if(modifyData.comment[0]) await queryRunner.manager.save(modifyData.comment);

      if(modifyBlockDataList.delete) {
        const { commentIdList, blockIdList } = modifyBlockDataList.delete;

        if(commentIdList) await queryRunner.manager.delete(BlockComment, commentIdList);

        if(blockIdList) {

          // const blockList: Block[] = await queryRunner.manager.find(Block, {
          //   where: {
          //     id: In(blockIdList)
          //   }
          // });
          
          // block-comment를 찾아서 삭제하는 것으로 수정해야함.
          // await queryRunner.manager
          //   .createQueryBuilder()
          //   .delete()
          //   .from(BlockComment)
          //   .where("blockComment.block IN(:...blockIdList)", { blockIdList: blockIdList })
          //   .execute();
          await queryRunner.manager.delete(Block, blockIdList);
        }
        
      }

      const pageVersion: PageVersion = queryRunner.manager.create(PageVersion, {
        id: pageVersions.next,
        preVersionId: pageVersions.current,
        page,
        pageModifyData: {
          modifyData: modifyBlockDataList
        }
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

      await this.pageService.savePage(page);
    }

    return new Response().body({ pageVersion: pageVersions.next });
  }

  public async addTest(data: string) {
    const test: Test = this.testRepository.create({ data });

    const test2: Test2 = this.test2Repository.create({ data });

    test2.test = test;

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.blockService.test(queryRunner, test);
      await queryRunner.manager.save(test2);
      

      await queryRunner.commitTransaction();
    } catch(e) {
      Logger.error(e);
      await queryRunner.rollbackTransaction();

      return false;
    } finally {
      await queryRunner.release();
    }

    const test21: Test = await this.testRepository.findOne({
      where: {
        data: "안녕하세요3"
      }
    });

    return this.test2Repository.count({
      where: {
        test: test21
      }
    });

  }

  public async addTest2(data: string) {
    const test: Test = this.testRepository.create({ data });

    const test2: Test2 = this.test2Repository.create({
      data
    });

    test2.test = test;

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.testRepository.save(test, {
        transaction: false
      })
      await this.test2Repository.save(test2,  {
        transaction: false
      })

      await queryRunner.commitTransaction();
    } catch(e) {
      Logger.error(e);
      await queryRunner.rollbackTransaction();

      return new Response().error(...SystemErrorMessage.db);

    } finally {
      await queryRunner.release();
    }

    const test21: Test = await this.testRepository.findOne({
      where: {
        data: "안녕하세요3"
      }
    });

    const count = await this.test2Repository.count({
      where: {
        test: test21
      }
    });

    return new Response().body({count});
  }

  public async addTest3(data: string) {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // await this.testRepository.update({
      //   id: 2,
      //   data: "SDddsad"
      // }, Test)

      await queryRunner.commitTransaction();
    } catch(e) {
      Logger.error(e);
      await queryRunner.rollbackTransaction();

      return false;
    } finally {
      await queryRunner.release();
    }

    const test21: Test = await this.testRepository.findOne({
      where: {
        data: "안녕하세요3"
      }
    });

    return this.test2Repository.count({
      where: {
        test: test21
      }
    });

  }

  public async deleteTest(id: number) {
    const test: Test[] = await this.testRepository.find({
      where: {
        data: "안녕하세요8"
      },
      select: ["id"]
    });

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(Test2)
        .where("test2.testId IN (:...test)", { test: test.map(test => test.id)} )
        .execute();

      await queryRunner.commitTransaction();

    } catch(e) {
      Logger.error(e);
      queryRunner.rollbackTransaction();

      return false;
    } finally {
      queryRunner.release();
    }

    return true;
    // return this.test2Repository
    //   .createQueryBuilder("test2")
    //   .delete()
    //   .where("test2.testId IN (:...tests)", { tests: test.map(test => test.id) })
    //   .execute();

    // console.log(test);

    // return await this.test2Repository
    //   .createQueryBuilder("test2")
    //   .where("test2.testId IN (:...tests)", { tests: test.map(test => test.id) })
    //   .getMany()
  }

  public async deleteTest2() {
    const test2: Test2[] = await this.test2Repository.find({
      where: {
        data: "안녕하세요"
      }
    });

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

    } catch(e) {

    } finally {

    }
  }

}
