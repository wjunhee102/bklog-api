import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from "typeorm";
import { Test2 } from "./test2.entity";

@Entity({ name: "test-table" })
export class Test {

  @PrimaryGeneratedColumn({
    type: "bigint"
  })
  id: number;

  @Column({ 
    type: "varchar",
    width: 255,
    nullable: true,
    default: null
  })
  data: string;

  @OneToOne(() => Test2, test2 => test2.test)
  test2: Test2;

}