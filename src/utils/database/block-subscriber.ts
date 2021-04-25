import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { Block } from "src/entities/bklog/block.entity";

@EventSubscriber()
export class BlockSubscriber implements EntitySubscriberInterface<Block> {

  listenTo() {
    return Block;
  }

  beforeInsert(event: InsertEvent<Block>) {
    console.log(`BEFORE POST INSERTED: `, event.entity);
  }
}