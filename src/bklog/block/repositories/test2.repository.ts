import { Repository, EntityRepository } from "typeorm";
import { Test2 } from '../../../entities/bklog/test2.entity';

@EntityRepository(Test2)
export class Test2Respository extends Repository<Test2>{}