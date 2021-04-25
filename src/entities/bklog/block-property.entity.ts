import { Entity, Column, PrimaryColumn } from "typeorm";

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

}