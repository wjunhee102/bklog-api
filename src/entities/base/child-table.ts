import { PrimaryColumn } from "typeorm";

export abstract class ChildTable {
  @PrimaryColumn({
    type: "varchar",
    width: 255
  })
  id: string;
}