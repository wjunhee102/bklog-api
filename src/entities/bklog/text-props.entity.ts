import { Entity, PrimaryGeneratedColumn, Column} from 'typeorm';
import { TextStyle } from 'src/types/bklog';

@Entity({name: "text_property"})
export class BlockTextProperty {

  @PrimaryGeneratedColumn({
    name: "bk_property_id",
    type: "bigint",
    
  })
  id: number;

  @Column({
    name: "block_uuid",
    type: "char",
    length: 40
  })
  blockId: string;
  
  @Column({
    type: "varchar",
    length: 20
  })
  type: string;

  @Column({
    type: "json",
    nullable: true,
    default: null
  })
  style: TextStyle;

  @Column({
    type: "json",
    nullable: true,
    default: null
  })
  contents: any;
}