import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne} from "typeorm";
import { Page } from "./page.entity";
import { PageModifyDateType } from "src/bklog/bklog.type";

@Entity({name: "page-version"})
export class PageVersion {
  @PrimaryColumn({
    type: "varchar",
    width: 255
  })
  id: string;

  @Column({
    name: "pre_version_id",
    type: "varchar",
    width: 255,
    nullable: true,
    default: null
  })
  preVersionId: string;

  @CreateDateColumn({
    name: "created_at"
  })
  createdDate: Date;

  @Column({
    name: "data",
    type: "json"
  })
  pageModifyData: PageModifyDateType;

  @ManyToOne(() => Page)
  page: Page;
}