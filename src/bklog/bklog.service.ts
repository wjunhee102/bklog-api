import { Injectable } from '@nestjs/common';
import { RequiredPageInfo, PageInfoList, RequiredBklogInfo } from './page/page.type';
import { PageService } from './page/page.service';
import { BlockService } from './block/block.service';
import { ResCreateBlockDate } from './block/block.type';
import { UserService } from 'src/user/user.service';
import { UserProfile } from 'src/entities/user/user-profile.entity';

@Injectable()
export class BklogService {
  constructor(
    private readonly pageService: PageService,
    private readonly blockService: BlockService,
    private readonly userService: UserService
  ){}

  public async createBklog(requiredBklogInfo: RequiredBklogInfo): Promise<string> {
    const userProfile: UserProfile | null = await this.userService.getUserProfile(requiredBklogInfo.profileId);
    
    if(!userProfile) {
      return null;
    }
    
    const requiredPageInfo: RequiredPageInfo = Object.assign(requiredBklogInfo, {
      userProfile
    });

    const pageId: string | null = await this.pageService.createPage(requiredPageInfo);

    if(pageId) {
      const resCreateBlockData: ResCreateBlockDate | null = await this.blockService.createFirstBlock({
        pageId,
        type: "text"
      });

      if(resCreateBlockData) {
        return pageId;
      } else {
        await this.pageService.removePage(pageId, requiredPageInfo.userId);
      }
    } 

    return null;
  }

  public async findPageList(penName: string, id?: string) {
    const profileId = await this.userService.findUserProfileId(penName);
    let scope = 4;
    if(!profileId) {
      return {
        success: false,
        pageList: null
      };
    }

    if(id) {
      // id가 해당 유저의 팔로워인지... 맞으면 scope에 대입.
  
    }
    console.log(profileId);
    const pageInfoList: PageInfoList[] | null = await this.pageService.findPublicPageList(profileId, scope); 
    console.log(pageInfoList);
    return  {
      success: pageInfoList? true : false,
      pageInfoList
    }
  }

}
