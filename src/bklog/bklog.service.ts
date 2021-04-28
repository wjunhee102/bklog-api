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
import { CommentToCommentRepository } from './page/repositories/comment-comment.repository';
import { Page } from 'src/entities/bklog/page.entity';
import { PageStar } from 'src/entities/bklog/page-star.entity';
import { PageVersion } from 'src/entities/bklog/page-version.entity';
import { PageVersionRepository } from './repositories/page-version.repository';
import { Token } from 'src/utils/base/token.util';
import { InfoToFindPageVersion, ResGetPage, ParamGetPageList, ModifyBlockType, ModifySet, PageVersions, ResModifyBlock, RequiredPageVersionIdList, ResCreateBklog } from './bklog.type';
import { Connection, In } from 'typeorm';
import { BlockComment } from 'src/entities/bklog/block-comment.entity';
import { Block } from 'src/entities/bklog/block.entity';
import { BlockProperty } from 'src/entities/bklog/block-property.entity';
import { TestRepository } from './block/repositories/test.repositoty';
import { Test } from 'src/entities/bklog/test.entity';
import { Test2 } from 'src/entities/bklog/test2.entity';
import { Test2Respository } from './block/repositories/test2.repository';

@Injectable()
export class BklogService {
  constructor(
    private connection: Connection,
    private readonly pageService: PageService,
    private readonly blockService: BlockService,
    private readonly userService: UserService,
    private readonly pageVersionRepository: PageVersionRepository,
    private readonly pageStarRepository: PageStarRepository,
    private readonly pageCommentRepository: PageCommentRepository,
    private readonly cTcRepository: CommentToCommentRepository,
    private readonly blockCommentRepository: BlockCommentRepository,
    private readonly testRepository: TestRepository,
    private readonly test2Repository: Test2Respository
  ){}

  private createPageVersion(
    page: Page, 
    modifyDataList: ModifyBlockType, 
    requiredIdList?: RequiredPageVersionIdList
  ): PageVersion {
    const pageVersion: PageVersion = this.pageVersionRepository.create({
      page,
      modifyDataList
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
  private async insertPageVersion(page: Page, modifyDataList: ModifyBlockType, RequiredIdList?: RequiredPageVersionIdList): Promise<PageVersion> {
    const pageVersion: PageVersion = this.pageVersionRepository.create({
      id: RequiredIdList? (RequiredIdList.id? RequiredIdList.id : Token.getUUID()) : Token.getUUID(),
      preVersionId: RequiredIdList? RequiredIdList.preVersionId? RequiredIdList.preVersionId : null : null,
      page,
      modifyDataList
    });

    await this.pageVersionRepository.save(pageVersion);

    return await this.findOnePageVersion({ id: pageVersion.id });
  }

  /**
   * 
   * @param profileId 
   * @param pageId 
   */
  private async insertPageStar(profileId: string, pageId: string): Promise<boolean> {
    try {
      const userProfile: UserProfile = await this.userService.getUserProfile(profileId);
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

    console.log(pageVersion, id);

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
   * error 처리를 해야함.
   * @param requiredBklogInfo 
   */
  public async createBklog(requiredBklogInfo: RequiredBklogInfo): Promise<ResCreateBklog> {
    const result: ResCreateBklog = {
      success: true,
      pageId: null,
      error: {
        notUserProfile: undefined,
        dataBaseError: undefined
      }
    }

    const userProfile: UserProfile | null = await this.userService.getUserProfile(requiredBklogInfo.profileId);
    
    if(!userProfile) {
      result.error.notUserProfile = true;
      return result;
    }
    
    const requiredPageInfo: RequiredPageInfo = Object.assign(requiredBklogInfo, {
      userProfile
    });

    const page: Page = this.pageService.createPage(requiredPageInfo);

    const block: Block = this.blockService.createBlockData(page);

    const blockData: BlockData = Object.assign({}, block, {
      blockComment: undefined, 
      page: undefined,
      property: Object.assign({}, block.property, {
        id: undefined
      })
    });

    const pageVersion: PageVersion = this.createPageVersion(page, {
      create: [
        {
          blockId: block.id,
          set: "block",
          payload: blockData
        }
      ]
    });

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(page);
      await queryRunner.manager.save(block.property);
      await queryRunner.manager.save(block);
      await queryRunner.manager.save(pageVersion);

      await queryRunner.commitTransaction();

      result.error = undefined;
      result.pageId = page.id;
      result.success = true;

    } catch(e) {

      Logger.error(e);
      await queryRunner.rollbackTransaction();

      result.error.dataBaseError = true;

      return result;

    } finally {
      await queryRunner.release();
    }

    return result;
  }

  /**
   * 
   * @param factorGetPageList 
   */
  public async findPageList(factorGetPageList: ParamGetPageList) {
    let scope = 4;

    if(factorGetPageList.reqUserId) {
      // id가 해당 유저의 팔로워인지... 맞으면 scope에 대입.
      
    }
    
    const pageInfoList: PageInfoList[] | null = await 
      this.pageService.findPublicPageList(
        factorGetPageList.pageUserInfo, 
        scope,
        factorGetPageList.skip,
        factorGetPageList.take
      ); 

    return  {
      success: pageInfoList? true : false,
      pageInfoList
    }
  }

  public async getPage(pageId: string, userId?: string): Promise<ResGetPage> {
    const page: Page | null = await this.pageService.getPage(pageId);
    const pageVersion: PageVersion = await this.findOneCurrentPageVersion(page);

    return page? 
      Object.assign({}, page, {
        blockList: page.blockList.map((block) => {
          return Object.assign({}, block, {
            page: undefined,
            blockComment: undefined,
            property: Object.assign({}, block.property, {
              id: undefined
            })
          })
        }),
        version: pageVersion.id,
        userProfile: undefined,
        profileId: page.userProfile.id,
        userId: undefined,
        editable: userId? userId === page.userId : false
      }) 
      : null;
  }

  /**
   * 
   * @param modifyBlockDataList 
   * @param pageId 
   * @param userId 
   * @param pageVersions 
   */
  public async modifyBlock(modifyBlockDataList: ModifyBlockType, pageId: string, userId: string, pageVersions: PageVersions): Promise<ResModifyBlock> {
    const result: ResModifyBlock = {
      success: false,
      pageVersion: null,
      error: {
        notEditable: undefined,
        notCurrentVersion: undefined,
        paramError: undefined,
        dataBaseError: undefined
      }
    }

    const page: Page = await this.pageService.getPage(pageId);

    if(page.userId !== userId) {
      result.error.notEditable = true;
      return result;
    }

    const  resCheckCurrentVersion = await this.checkCurrentPageVersion(pageVersions.current, page);

    result.pageVersion = resCheckCurrentVersion.pageVersion;

    if(!resCheckCurrentVersion.success) {
      result.error.notCurrentVersion = true;
      return result;
    }

    const modifyData: ModifyData = {
      block: [],
      property: [],
      comment: []
    }

    if(modifyBlockDataList.create) {
      const resCreate: ModifyData | null = await this.blockService.createData(modifyBlockDataList.create, page);

      if(!resCreate) {
        result.error.paramError = true;
        return result;
      }

      if(resCreate.block) {
        modifyData.block = modifyData.block.concat(resCreate.block);
      }

      if(resCreate.property) {
        modifyData.property = modifyData.property.concat(resCreate.property);
      }

      if(resCreate.comment) {
        modifyData.comment = modifyData.comment.concat(resCreate.comment);
      }
    }

    if(modifyBlockDataList.update) {
      const resUpdate: ModifyData | null = await this.blockService.updateData(modifyBlockDataList.update);

      if(!resUpdate) {
        result.error.paramError = true;
        return result;
      }

      if(resUpdate.block) {
        modifyData.block = modifyData.block.concat(resUpdate.block);
      }

      if(resUpdate.property) {
        modifyData.property = modifyData.property.concat(resUpdate.property);
      }

      if(resUpdate.comment) {
        modifyData.comment = modifyData.comment.concat(resUpdate.comment);
      }
    }

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      
      if(modifyData.property) await queryRunner.manager.save(modifyData.property);
      if(modifyData.block) await queryRunner.manager.save(modifyData.block);
      if(modifyData.comment) await queryRunner.manager.save(modifyData.comment);

      if(modifyBlockDataList.delete) {
        const { commentIdList, blockIdList } = modifyBlockDataList.delete;

        if(commentIdList) await queryRunner.manager.delete(BlockComment, commentIdList);

        if(blockIdList) {

          const blockList: Block[] = await queryRunner.manager.find(Block, {
            relations: ["property"],
            where: {
              id: In(blockIdList)
            },
            select: ["property"]
          });

          await queryRunner.manager
            .createQueryBuilder()
            .delete()
            .from(BlockComment)
            .where("blockComment.block IN(:...blockIdList)", { blockIdList: blockIdList })
            .execute();
          await queryRunner.manager.delete(Block, blockList);
          await queryRunner.manager.delete(
            BlockProperty, 
            blockList.map(block => block.property.id)
          );
        }
        
      }

      const pageVersion: PageVersion = await queryRunner.manager.create(PageVersion, {
        id: pageVersions.next,
        preVersionId: pageVersions.current,
        page,
        modifyDataList: modifyBlockDataList
      });

      await queryRunner.manager.save(pageVersion);

      await queryRunner.commitTransaction();

      result.success = true;
      result.pageVersion = pageVersions.next;
      result.error = undefined;

    } catch(e) {
      Logger.error(e);
      await queryRunner.rollbackTransaction();

      result.error.dataBaseError = true;

    } finally {
      await queryRunner.release();
    }

    return result;
  }

  public async addTest(data: string) {
    const test: Test = this.testRepository.create({ data });

    const test2: Test2 = this.test2Repository.create({
      data
    });

    test2.test = test;

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(test);
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
