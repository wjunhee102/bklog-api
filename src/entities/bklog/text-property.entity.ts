import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { TextStyle, TextContents } from "src/types/bklog";

@Entity({name: "text-property"})
export class BlockTextProperty {
  
  @PrimaryGeneratedColumn({
    type: "bigint"
  })
  id: number;

  @Column({
    name: "block_id",
    type: "varchar",
    length: 255
  })
  blockId: string;

  @Column({
    type: "varchar",
    length: 40
  })
  type: string;

  @Column({
    type: "json"
  })
  style: TextStyle | null;

  @Column({
    type: "json"
  })
  contents: TextContents[];
}