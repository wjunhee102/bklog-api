import { CreateDateColumn, UpdateDateColumn } from "typeorm";

export abstract class DateTable {
  @CreateDateColumn({
    name: "created_at"
  })
  createdDate: Date;

  @UpdateDateColumn({
    name: "updated_at"
  })
  updatedDate: Date;
}