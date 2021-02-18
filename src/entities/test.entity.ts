import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({name: "test"})
export class Test {

  @PrimaryGeneratedColumn({
    name: "test_id"
  })
  id: number;

  @Column("simple-array")
  children: string[];
}