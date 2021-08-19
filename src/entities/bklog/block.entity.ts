import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany } from "typeorm";
import { BlockTypes } from "src/bklog/block/block.type";
import { Page } from "./page.entity";
import { BlockComment } from "./block-comment.entity";

@Entity({name: "block"})
export class Block {
  
  @PrimaryColumn({
    type: "varchar",
    width: 255
  })
  id: string;

  @Column({
    type: "varchar",
    width: 50,
    default: "1"
  })
  position: string;

  @Column({
    type: "varchar",
    length: 20,
    default: "text"
  })
  type: BlockTypes;

  @Column({
    type: "varchar",
    length: 20,
    default: "bk-p"
  })
  styleType: string;

  @Column({
    type: "json",
    nullable: true,
    default: null
  })
  styles: any;

  @Column({
    type: "json"
  })
  contents: any[];

  @ManyToOne(() => Page, page => page.blockList)
  page: Page;

  @OneToMany(() => BlockComment, blockComment => blockComment.block)
  blockComments: BlockComment[];
  
}