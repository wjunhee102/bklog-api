import { DateTable } from "./date-table";
import { Column, PrimaryColumn } from "typeorm";

export abstract class CommentTable extends DateTable {

  @PrimaryColumn({
    type: "varchar",
    width: 255
  })
  id: string;

  @Column({
    type: "json"
  })
  comments: any;
  
};