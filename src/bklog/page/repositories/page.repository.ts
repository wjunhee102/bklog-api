import { EntityRepository, Repository } from "typeorm";
import { Page } from "src/entities/bklog/page.entity";

@EntityRepository(Page)
export class PageRepository extends Repository<Page> {}