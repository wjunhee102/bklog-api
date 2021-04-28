import { Entity, Column, PrimaryColumn, OneToOne } from "typeorm";
import { Block } from "./block.entity";

@Entity({ name: "block-property" })
export class BlockProperty {

  @PrimaryColumn({
    type: "varchar",
    width: 255
  })
  id: string;

  @Column({
    type: "varchar",
    length: 40
  })
  type: string;

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

  @OneToOne(() => Block, block => block.property)
  block: Block;

}