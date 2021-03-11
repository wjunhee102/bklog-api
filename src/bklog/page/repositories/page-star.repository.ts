import { Repository, EntityRepository } from "typeorm";
import { PageStar } from "src/entities/bklog/page-star.entity";

@EntityRepository(PageStar)
export class PageStarRepository extends Repository<PageStar> {}