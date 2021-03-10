import { Entity, Column, PrimaryColumn } from "typeorm";
import { BlockTypes } from "src/bklog/block/block.type";

@Entity({name: "block"})
export class Block {
  @PrimaryColumn({
    name: "block_id",
    type: "varchar",
    width: 255
  })
  id: string;

  @Column({
    name: "page_id",
    type: "varchar",
    length: 255
  })
  pageId: string;

  @Column({
    name: "preBlock_id",
    type: "varchar",
    length: 255,
    nullable: true,
    default: null
  })
  preBlockId: string;

  @Column({
    name: "nextBlock_id",
    type: "varchar",
    length: 255,
    nullable: true,
    default: null
  })
  nextBlockId: string;

  @Column({
    name: "parentBlock_id",
    type: "varchar",
    length: 255,
    nullable: true,
    default: null
  })
  parentBlockId: string;

  @Column({
    name: "children_id",
    type: 'json'
  })
  children: string[] | null;

  @Column({
    type: "varchar",
    length: 20,
    default: "text"
  })
  type: BlockTypes;
}