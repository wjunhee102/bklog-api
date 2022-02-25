import { PrimaryGeneratedColumn } from "typeorm";

export abstract class SubTable {
  @PrimaryGeneratedColumn({
    type: "bigint"
  })
  id!: number;
}