import { Injectable, Logger } from '@nestjs/common';
import { RequiredPageInfo, PageInfoList, RequiredBklogInfo } from './page/page.type';
import { PageService } from './page/page.service';
import { BlockService } from './block/block.service';
import { BlockData } from './block/block.type';
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
import { Token } from 'src/util/token.util';
import { InfoToFindPageVersion, ResGetPage, ParamGetPageList, ModifyBlockType, ModifySet, PageVersions, ResModifyBlock, RequiredPageVersionIdList } from './bklog.type';
import { Connection } from 'typeorm';

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
  private async checkCurrentPageVersion(id: string, page: Page): Promise<boolean> {
    const pageVersion: PageVersion = await this.findOneCurrentPageVersion(page);

    console.log(pageVersion, id);

    if(!pageVersion || pageVersion.id !== id) {
      return false;
    } 

    return true;
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

  public async modifyBlock(modifyBlockDataList: ModifyBlockType, pageId: string, userId: string, pageVersions: PageVersions): Promise<ResModifyBlock> {

    const page: Page = await this.pageService.getPage(pageId);

    if(page.userId !== userId) {
      return {
        success: false,
        error: {
          notEditable: true,
          notCurrentVersion: false,
          dataBaseError: false
        }
      }
    }

    // page version의 가장 최근을 찾아야 함.
    const  resCheckCurrentVersion: boolean = await this.checkCurrentPageVersion(pageVersions.current, page);

    console.log(modifyBlockDataList);

    if(!resCheckCurrentVersion) {
      return {
        success: false,
        error: {
          notEditable: false,
          notCurrentVersion: true,
          dataBaseError: false
        }
      }
    }

    for(const [key, value] of Object.entries(modifyBlockDataList)) {
      switch(key) {
        case "create":
          const resCreate: boolean = await this.blockService.createData(value, page);
          
          if(!resCreate) {
            return {
              success: false,
              error: {
                notEditable: false,
                notCurrentVersion: false,
                dataBaseError: true
              }
            };
          }

          break;

        case "update":
          const resUpdate: boolean = await this.blockService.updateData(value);

          if(!resUpdate) {
            return {
              success: false,
              error: {
                notEditable: false,
                notCurrentVersion: false,
                dataBaseError: true
              }
            };
          }

          break;
        
        case "delete": 
          const resDelete: boolean = await this.blockService.deleteData(value);

          if(!resDelete) {
            return {
              success: false,
              error: {
                notEditable: false,
                notCurrentVersion: false,
                dataBaseError: true
              }
            };
          }

          break;
        
        default: 
          return {
            success: false,
            error: {
              notEditable: false,
              notCurrentVersion: false,
              dataBaseError: true
            }
          };
      }
    }

    const resVerion = await this.insertPageVersion(
      page, 
      modifyBlockDataList, 
      { 
        id: pageVersions.next, 
        preVersionId: pageVersions.current 
      }
    );

    if(!resVerion) {
      // rollback

      return {
        success: false,
        error: {
          notEditable: false,
          notCurrentVersion: false,
          dataBaseError: true
        }
      };
    }

    return {
      success: true
    }
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
