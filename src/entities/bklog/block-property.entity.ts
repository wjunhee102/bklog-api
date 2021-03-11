import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "block-property" })
export class BlockProperty {
  @PrimaryGeneratedColumn({
    type: "bigint"
  })

  @Column({
    type: "varchar",
    length: 40
  })
  type: string;

  @Column({
    type: "json"
  })
  style: any;

  @Column({
    type: "json"
  })
  contents: any[];
}