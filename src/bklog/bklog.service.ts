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
import { InfoToFindPageVersion, ResGetPage, ParamGetPageList, ModifyBlockType, ModifySet } from './bklog.type';

@Injectable()
export class BklogService {
  constructor(
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
  private async insertPageVersion(page: Page, blockDataList: BlockData[]): Promise<PageVersion> {
    const pageVersion: PageVersion = this.pageVersionRepository.create({
      id: Token.getUUID(),
      page,
      blockDataList
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

  private async insertPageComment() {
    
  }

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
    const pageVersion: PageVersion = await this.insertPageVersion(page, [blockData]);

    if(!pageVersion) {
      await this.blockService.removeBlockData([blockData.id]);
      await this.pageService.removePage(page.id, requiredBklogInfo.userId);
      return null;
    }

    return page.id;
  }

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
        versionList: undefined,
        version: page.versionList[0].id,
        userProfile: undefined,
        profileId: page.userProfile.id,
        userId: undefined,
        editable: userId? userId === page.userId : false
      }) 
      : null;
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
