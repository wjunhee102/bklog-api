import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany } from "typeorm";
import { Page } from "./page.entity";
import { BlockComment } from "./block-comment.entity";
import { BlockDataProps, UnionBlockGenericType } from "src/bklog/block/type";
import { RawModifyData, UpdateModifyBlockGenericType } from "src/bklog/bklog.type";

@Entity({name: "block"})
export class Block<T extends UnionBlockGenericType = UnionBlockGenericType> {
  
  @PrimaryColumn({
    type: "varchar",
    width: 255
  })
  id!: string;

  @Column({
    type: "varchar",
    width: 50,
    default: "1"
  })
  position!: string;

  @Column({
    type: "varchar",
    length: 20,
    default: "text"
  })
  type!: T["type"];

  @Column({
    type: "varchar",
    length: 20,
    default: "bk-p"
  })
  styleType!: string;

  @Column({
    type: "json",
    nullable: true,
    default: null
  })
  styles!: T["styles"];

  @Column({
    type: "json"
  })
  contents!: T["contents"];

  @ManyToOne(() => Page, page => page.blockList)
  page!: Page;

  @OneToMany(() => BlockComment, blockComment => blockComment.block)
  blockComments!: BlockComment[];

  updateData({ id, type, payload }: RawModifyData<UpdateModifyBlockGenericType<T>>) {
    if(this.id !== id || this.type !== type) throw new Error("id or type does not match");

    const payloadKeyList: Array<keyof typeof payload> = Object.keys(payload) as Array<keyof typeof payload>;

    if(payloadKeyList.length < 1) throw new Error("payload is empty");
    
    for(const key of payloadKeyList) {
      this[key] = payload[key] as never;
    }
    
    return this;
  }
  
}