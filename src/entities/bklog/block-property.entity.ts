import { Entity, Column } from "typeorm";
import { SubTable } from "../base/sub-table";

@Entity({ name: "block-property" })
export class BlockProperty extends SubTable {

  @Column({
    type: "varchar",
    length: 40
  })
  type: string;

  @Column({
    type: "json"
  })
  style: any;

  @Column({
    type: "json"
  })
  contents: any[];

}