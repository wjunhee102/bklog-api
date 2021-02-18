import { PrimaryGeneratedColumn, Entity, Column } from "typeorm";

@Entity({name: "block"})
export class Block {
  @PrimaryGeneratedColumn({
    name: "block_id"
  })
  id: number;

  @Column({
    name: "uuid",
    type: "char",
    length: 40
  })
  blockId: string;

  @Column({
    name: "page_uuid",
    type: "varchar",
    length: 40
  })
  pageId: string;

  @Column({
    name: "preBlock_uuid",
    type: "varchar",
    length: 40,
    nullable: true,
    default: null
  })
  preBlockId: string | null;

  @Column({
    name: "nextBlock_uuid",
    type: "varchar",
    length: 40,
    nullable: true,
    default: null
  })
  nextBlockId: string | null;

  @Column({
    name: "parentBlock_uuid",
    type: "varchar",
    length: 40,
    nullable: true,
    default: null
  })
  parentBlockId: string | null;

  @Column({
    name: "children_uuid",
    type: 'json',
    nullable: true,
    default: null
  })
  children: string[] | null;

  @Column({
    type: "varchar",
    length: 20,
    default: "block"
  })
  type: string;
}