import { Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity({name: "block_property"})
export class BlockProperty {

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
  style: any;

  @Column({
    type: "json",
    nullable: true,
    default: null
  })
  contents: any;
}