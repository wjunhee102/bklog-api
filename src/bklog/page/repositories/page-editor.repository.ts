import { PageEditor } from "src/entities/bklog/page-editor.entity";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(PageEditor)
export class PageEditorRepository extends Repository<PageEditor> {}