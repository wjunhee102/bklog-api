import { SubTable } from "../base/sub-table";
import { Entity, Column, OneToOne, JoinColumn } from "typeorm";
import { Test } from "./test.entity";

@Entity({ name: "test2"})
export class Test2 extends SubTable {

  @Column({
    type: "varchar",
    width: 255
  })
  data: string;

  @OneToOne(() => Test)
  @JoinColumn()
  test: Test;

}