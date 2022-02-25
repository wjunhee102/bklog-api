import { Column, PrimaryColumn } from "typeorm";

export class Test {

  @PrimaryColumn({
    type: "bigint"
  })
  id!: number;

  @Column({
    type: "varchar"
  })
  text!: string
}