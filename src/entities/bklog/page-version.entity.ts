import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne} from "typeorm";
import { BlockData } from "src/bklog/block/block.type";
import { Page } from "./page.entity";

@Entity({name: "block-version"})
export class PageVersion {
  @PrimaryColumn({
    name: "page_version_id",
    type: "varchar",
    width: 255
  })
  id: string;

  @Column({
    name: "pre_version_id",
    type: "varchar",
    width: 255,
    nullable: true,
    default: null
  })
  preVersionId: string;

  @CreateDateColumn({
    name: "created_at"
  })
  createdDate: Date;

  @Column({
    name: "block_data",
    type: "json"
  })
  blockDataList: BlockData[];

  @ManyToOne(() => Page)
  page: Page;
}