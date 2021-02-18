import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: "page" })
export class Page {

  @PrimaryGeneratedColumn({
    name: "page_id",
    type: "bigint"
  })
  id: number;

  @Column({
    name: "uuid",
    type: "char",
    length: 40
  })
  pageId: string;

  @Column({
    name: "author_uuid",
    type: "char",
    length: 40
  })
  authorId: string;

  @Column({
    name: "editor_list",
    type: "json",
    nullable: true,
    default: null
  })
  editorList: string[];
}