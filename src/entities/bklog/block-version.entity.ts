import { Entity, Column, PrimaryColumn, CreateDateColumn} from "typeorm";
import { BlockData } from "src/bklog/block/block.type";

@Entity({name: "block-version"})
export class BlockVersion {
  @PrimaryColumn({
    name: "page_version_id",
    type: "varchar",
    width: 255
  })
  id: string;

  @Column({
    name: "page_id",
    type: "varchar",
    width: 255
  })
  pageId: string;

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
}