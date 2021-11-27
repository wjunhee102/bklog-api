import { PrimaryColumn, Column } from "typeorm";
import { DateTable } from "./date-table";

export abstract class MainTable extends DateTable {

  @PrimaryColumn({
    type: "varchar",
    width: 255
  })
  id: string;

  @Column({
    name: "removed_at",
    type: "datetime",
    nullable: true
  })
  removedDate: Date;

}