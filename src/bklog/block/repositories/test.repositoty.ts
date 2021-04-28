import { AbstractRepository, EntityRepository, Repository } from "typeorm";
import { Test } from "src/entities/bklog/test.entity";

@EntityRepository(Test)
export class TestRepository extends Repository<Test> {}