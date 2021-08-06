import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { UserProfile } from '../user/user-profile.entity';
import { PageStar } from './page-star.entity';
import { PageVersion } from './page-version.entity';
import { Block } from './block.entity';
import { MainTable } from '../base/main-table';
import { PageComment } from './page-comment.entity';
import { BlockComment } from './block-comment.entity';

@Entity({ name: "page" })
export class Page extends MainTable {

  @Column({
    type: "varchar",
    width: 100
  })
  title: string;

  @Column({
    name: "cover_image",
    type: "varchar",
    width: 255,
    nullable: true,
    default: null
  })
  coverImage: string;

  @Column({
    name: "cover_color",
    type: "varchar",
    width: 100,
    nullable: true,
    default: null
  })
  coverColor: string;

  @Column({
    name: "last_access_date",
    type: "datetime",
    nullable: true,
    default: null
  })
  lastAccessDate: Date;

  @Column({
    type: "bigint",
    default: 0
  })
  views: number;

  @Column({
    name: "user_id",
    type: "varchar",
    width: 255
  })
  userId: string;

  // 0: 삭제 예정, 1: 개인, 2: following, 3: org, 4: following || org, 5: public;
  @Column({
    name: "disclosure_scope",
    type: "tinyint",
    default: 5
  })
  disclosureScope: number;

  @Column({
    name: "edit_lock",
    type: "boolean",
    default: false
  })
  editLock: boolean;

  @Column({
    name: "updating",
    type: "boolean",
    default: false
  })
  updating: boolean;

  @ManyToOne(() => UserProfile, userProfile => userProfile.pages, {
    nullable: true
  })
  userProfile: UserProfile;

  @OneToMany(() => PageVersion, pageVersion => pageVersion.page)
  versionList: PageVersion[];

  @OneToMany(() => PageStar, pageStar => pageStar.page)
  pageStar: PageStar[];

  @OneToMany(() => PageComment, pageComments => pageComments.page)
  pageComments: PageComment[];

  @OneToMany(() => Block, block => block.page)
  blockList: Block[];
  
  @OneToMany(() => BlockComment, blockComment => blockComment.page)
  blockComments: BlockComment[];

}