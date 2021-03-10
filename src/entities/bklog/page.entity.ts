import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: "page" })
export class Page {

  @PrimaryColumn({
    name: "page_id",
    type: "varchar",
    width: 255
  })
  id: string;

  @Column({
    type: "varchar",
    width: 100
  })
  title: string;

  @Column({
    name: "cover_image",
    type: "varchar",
    width: 255,
    nullable: true,
    default: null
  })
  coverImage: string;

  @Column({
    name: "cover_color",
    type: "varchar",
    width: 100,
    nullable: true,
    default: null
  })
  coverColor: string;

  @CreateDateColumn({
    name: "created_at"
  })
  createdDate: Date;

  @UpdateDateColumn({
    name: "updated_at"
  })
  updatedDate: Date;

  @Column({
    name: "last_access_date",
    type: "datetime",
    nullable: true,
    default: null
  })
  lastAccessDate: Date;

  @Column({
    type: "bigint",
    default: 0
  })
  views: number;

  @Column({
    name: "profile_id",
    type: "varchar",
    width: 255
  })
  profileId: string;

  @Column({
    name: "user_id",
    type: "varchar",
    width: 255
  })
  userId: string;

  @Column({
    type: "tinyint",
    default: 4
  })
  private: number;

}