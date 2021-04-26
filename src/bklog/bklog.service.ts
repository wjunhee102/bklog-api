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
import { InfoToFindPageVersion, ResGetPage, ParamGetPageList, ModifyBlockType, ModifySet, PageVersions, ResModifyBlock, RequiredPageVersionIdList } from './bklog.type';
import { Connection, In } from 'typeorm';
import { BlockComment } from 'src/entities/bklog/block-comment.entity';
import { Block } from 'src/entities/bklog/block.entity';
import { BlockProperty } from 'src/entities/bklog/block-property.entity';
import { BlockRepository } from './block/repositories/block.repository';

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
    private readonly blockCommentRepository: BlockCommentRepository
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
  private async insertPageVersion(page: Page, modifyDataList: ModifyBlockType, RequiredIdList?: RequiredPageVersionIdList): Promise<PageVersion> {
    const pageVersion: PageVersion = this.pageVersionRepository.create({
      id: RequiredIdList? (RequiredIdList.id? RequiredIdList.id : Token.getUUID()) : Token.getUUID(),
      preVersionId: RequiredIdList? RequiredIdList.preVersionId? RequiredIdList.preVersionId : null : null,
      page,
      modifyDataList
    });

    const queryRunner = this.connection.createQueryRunner();

    // await this.pageVersionRepository.save(pageVersion);
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(pageVersion);

      await queryRunner.commitTransaction();
    } catch(e) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

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
   * 
   * @param requiredBklogInfo 
   */
  public async createBklog(requiredBklogInfo: RequiredBklogInfo): Promise<string> {
    const userProfile: UserProfile | null = await this.userService.getUserProfile(requiredBklogInfo.profileId);
    
    if(!userProfile) {
      return null;
    }
    
    const requiredPageInfo: RequiredPageInfo = Object.assign(requiredBklogInfo, {
      userProfile
    });

    const page: Page | null = await this.pageService.createPage(requiredPageInfo);

    if(!page) {
      return null;
    }
    
    const blockData: BlockData | null = await this.blockService.createBlockData(page);

    if(!blockData) {
      await this.pageService.removePage(page.id, requiredPageInfo.userId);
      return null;
    }
    
    // pageversion update;
    const pageVersion: PageVersion = await this.insertPageVersion(page, {
      create: [
        {
          blockId: blockData.id,
          set: "block",
          payload: blockData
        }
      ]
    });

    if(!pageVersion) {
      await this.blockService.removeBlockData([blockData.id]);
      await this.pageService.removePage(page.id, requiredBklogInfo.userId);
      return null;
    }

    return page.id;
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
        scope
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

    for(const [key, value] of Object.entries(modifyBlockDataList)) {
      if(key === "create") {
        const resCreate: ModifyData | null = await this.blockService.createData(value, page);

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

      if(key === "update") {
        const resUpdate: ModifyData | null = await this.blockService.updateData(value);

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
    }

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      
      if(modifyData.property) await queryRunner.manager.save(modifyData.property);
      if(modifyData.block) await queryRunner.manager.save(modifyData.block);
      if(modifyData.comment) await queryRunner.manager.save(modifyData.comment);

      if(modifyBlockDataList.delete) {
        const deleteData = modifyBlockDataList.delete;

        let propertyIdList: string[]  = [];
        let commentIdList: string[] = [];

        if(deleteData.blockIdList) {
          const blockList: Block[] = await queryRunner.manager.find(Block, {
            relations: ["property", "blockComment"],
            where: {
              id: In(deleteData.blockIdList)
            }
          });

          for(const block of blockList) {
            propertyIdList.push(block.property.id);
            
            if(block.blockComment[0]) {
              
              commentIdList = commentIdList.concat(
                block.blockComment.map(comment => comment.id)
              );

            }
          }

        }

        if(deleteData.commentIdList) {
          commentIdList = commentIdList.concat(deleteData.commentIdList);
        }
        
        if(commentIdList[0]) await queryRunner.manager.delete(BlockComment, commentIdList);
        
        if(deleteData.blockIdList) {
          await queryRunner.manager.delete(Block, deleteData.blockIdList);
          await queryRunner.manager.delete(BlockProperty, propertyIdList);
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

  // private async modifyBlock(modifyBlockDataList: ModifyBlockType[]) {

  //   const param = modifyBlockDataList.reduce((acc, currentValue)=>{
  //     acc[currentValue.command].push({
  //       set: currentValue.set,
  //       payload: currentValue.payload
  //     });

  //     return acc;

  //   }, {
  //     create: [],
  //     update: [],
  //     delete: []
  //   });

  //   console.log(param);

  //   for(const { command, set, payload } of modifyBlockDataList) {
  //     switch(command) {
  //       case "create":
  //         const resCreate: boolean = await this.blockService.createData(set, payload);
  //         if(!resCreate) return resCreate;
  //         break;

  //       case "update":
  //         const resUpdate: boolean = await this.blockService.updateData(set, payload);
  //         if(!resUpdate) return resUpdate;
  //         break;

  //       case "delete":
  //         const resDelete: boolean = await this.blockService.deleteData(set, payload);
  //         if(!resDelete) return resDelete;
  //         break;

  //       default: 
  //         return false;
  //     }
  //   }

  //   return true;
  // }

}
