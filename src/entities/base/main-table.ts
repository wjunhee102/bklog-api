import { PrimaryColumn } from "typeorm";
import { DateTable } from "./date-table";


export abstract class MainTable extends DateTable {

  @PrimaryColumn({
    type: "varchar",
    width: 255
  })
  id: string;

}