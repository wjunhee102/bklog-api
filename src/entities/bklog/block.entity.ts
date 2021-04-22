import { Entity, Column, PrimaryColumn, OneToOne, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { BlockTypes } from "src/bklog/block/block.type";
import { Page } from "./page.entity";
import { BlockComment } from "./block-comment.entity";
import { BlockProperty } from "./block-property.entity";

@Entity({name: "block"})
export class Block {
  
  @PrimaryColumn({
    type: "varchar",
    width: 255
  })
  id: string;

  @Column({
    name: "pre_block_id",
    type: "varchar",
    length: 255,
    nullable: true,
    default: null
  })
  preBlockId: string;

  @Column({
    name: "next_block_id",
    type: "varchar",
    length: 255,
    nullable: true,
    default: null
  })
  nextBlockId: string;

  @Column({
    name: "parent_block_id",
    type: "varchar",
    length: 255,
    nullable: true,
    default: null
  })
  parentBlockId: string;

  @Column({
    type: "varchar",
    length: 20,
    default: "text"
  })
  type: BlockTypes;

  @Column({
    type: 'json'
  })
  children: string[] | null;

  @OneToOne(() => BlockProperty)
  @JoinColumn()
  property: BlockProperty;

  @ManyToOne(() => Page)
  page: Page;

  @OneToMany(() => BlockComment, blockComment => blockComment.block)
  blockComment: BlockComment[];
  
}