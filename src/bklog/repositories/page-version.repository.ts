import { Repository, EntityRepository } from "typeorm";
import { PageVersion } from "src/entities/bklog/page-version.entity";

@EntityRepository(PageVersion)
export class PageVersionRepository extends Repository<PageVersion> {}