import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { UserProfile } from '../user/user-profile.entity';
import { PageStar } from './page-star.entity';
import { PageVersion } from './page-version.entity';
import { Block } from './block.entity';
import { MainTable } from '../base/main-table';
import { PageComment } from './page-comment.entity';
import { BlockComment } from './block-comment.entity';
import { PageEditor } from './page-editor.entity';

@Entity({ name: "page" })
export class Page extends MainTable {

  @Column({
    name: "parent_page_id",
    type: "varchar",
    width: 255,
    nullable: true,
    default: null
  })
  parentPageId!: string; 

  @Column({
    type: "varchar",
    width: 100
  })
  title!: string;

  @Column({
    type: "varchar",
    width: 50,
    nullable: true,
    default: null
  })
  emoji!: string;

  @Column({
    name: "cover_image",
    type: "varchar",
    width: 255,
    nullable: true,
    default: null
  })
  coverImage!: string;

  @Column({
    name: "cover_color",
    type: "varchar",
    width: 100,
    nullable: true,
    default: null
  })
  coverColor!: string;

  @Column({
    name: "last_access_date",
    type: "datetime",
    nullable: true,
    default: null
  })
  lastAccessDate!: Date;

  @Column({
    type: "bigint",
    default: 0
  })
  views!: number;

  @Column({
    name: "user_id",
    type: "varchar",
    width: 255
  })
  userId!: string;

  // 0: 삭제 예정, 1: 생성자, 2: following, 3: org, 4: following || org, 5: public;
  @Column({
    name: "discloure_scope",
    type: "tinyint",
    default: 1
  })
  disclosureScope!: number;

   // 0: 주 작성자, 1: master, 2: default;
  @Column({
    name: "editable_scope",
    type: "tinyint",
    default: 0
  })
  editableScope!: number;

  @Column({
    name: "edit_lock",
    type: "boolean",
    default: false
  })
  editLock!: boolean;

  @Column({
    name: "updating",
    type: "boolean",
    default: false
  })
  updating!: boolean;

  @ManyToOne(() => UserProfile, userProfile => userProfile.pageList, {
    nullable: true
  })
  userProfile!: UserProfile;

  @OneToMany(() => PageVersion, pageVersion => pageVersion.page)
  versionList!: PageVersion[];

  @OneToMany(() => PageStar, pageStar => pageStar.page)
  pageStar!: PageStar[];

  @OneToMany(() => PageComment, pageComments => pageComments.page)
  pageCommentList!: PageComment[];

  @OneToMany(() => Block, block => block.page)
  blockList!: Block[];
  
  @OneToMany(() => BlockComment, blockComment => blockComment.page)
  blockCommentList!: BlockComment[];

  @OneToMany(() => PageEditor, pageEditor => pageEditor.page)
  editorList!: PageEditor[];

}