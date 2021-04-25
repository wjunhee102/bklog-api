import { Injectable, Logger } from '@nestjs/common';
import { BlockRepository } from './repositories/block.repository';
import { RequiredBlock, RequiredBlockProperty, BlockData, BlockUpdateProps, PropertyUpdateProps, ModifyData } from './block.type';
import { Block } from 'src/entities/bklog/block.entity';
import { Token } from 'src/util/token.util';
import { BlockPropertyRepository } from './repositories/block-property.repository';
import { BlockProperty } from 'src/entities/bklog/block-property.entity';
import { Page } from 'src/entities/bklog/page.entity';
import { In } from 'typeorm';
import { BlockCommentRepository } from './repositories/block-comment.repository';
import { ParamModifyBlock, ParamCreateModifyBlock, ParamCreateBlock, ParamCreateComment } from '../bklog.type';
import { BlockComment } from 'src/entities/bklog/block-comment.entity';

@Injectable()
export class BlockService {
  constructor(
    private readonly blockRepository   : BlockRepository,
    private readonly propertyRepository: BlockPropertyRepository,
    private readonly blockCommentRepository: BlockCommentRepository
  ){}

  /**
   * block id
   * @param id 
   */
  private async findOneBlock(id: string): Promise<Block> {
    return await this.blockRepository.findOne({
      relations: ["property"],
      where: { id }
    });
  }
  
  /**
   * block property id
   * @param id 
   */
  private async findOneProperty(id: string): Promise<BlockProperty> {
    const block: Block = await this.blockRepository
      .createQueryBuilder("block")
      .leftJoinAndSelect(
        "block.property",
        "block-property"
      )
      .where({ id })
      .select("block.property")
      .getOne()

    if(!block) {
      return null;
    }
    
    return block.property
  }

  /**
   * 
   * @param blockList 
   */
  private async saveBlock(blockList: Block[]): Promise<boolean> {
    try {
      await this.blockRepository.save(blockList);

      return true;
    } catch(e) {
      Logger.error(e);

      return false;
    }
  }

  /**
   * 
   * @param propertyList 
   */
  private async saveProperty(propertyList: BlockProperty[]): Promise<boolean> {
    try {
      await this.propertyRepository.save(propertyList);

      return true;
    } catch(e) {
      Logger.error(e);

      return false;
    }
  }

  /**
   * 
   * @param requiredBlock 
   */
  private async insertBlock(requiredBlock: RequiredBlock): Promise<Block> {
    const block: Block = await this.blockRepository.create(requiredBlock);

    await this.saveBlock([block]);

    return await this.findOneBlock(block.id);
  }

  /**
   * 
   * @param requiredProperty 
   */
  private async insertProperty(requiredProperty: RequiredBlockProperty): Promise<BlockProperty> {
    const property: BlockProperty = await this.propertyRepository.create(requiredProperty);
    
    property.id = Token.getUUID();

    await this.saveProperty([property]);

    return await this.propertyRepository.findOne({
      where: {
        id: property.id
      }
    });
  }

  /**
   * 전부 id 배열로 바꿔야 함.
   * @param block 
   */
  // private async deleteBlock(block: Block): Promise<boolean> {
  //   try {
  //     console.log("1");
  //     await this.blockRepository.delete([block.id]);

  //     return true;
  //   } catch(e) {
  //     Logger.error(e);

  //     return false;
  //   }
  // }

  /**
   * 
   * @param blockIdList 
   */
  private async deleteBlock(blockIdList: string[]): Promise<boolean> {
    try {
      await this.blockRepository.delete(blockIdList);

      return true;
    } catch(e) {
      Logger.error(e);

      return false;
    }
  }

  /**
   * 
   * @param property 
   */
  // private async deleteProperty(property: BlockProperty): Promise<boolean> {
  //   try {
  //     console.log("2");
  //     await this.propertyRepository.delete([property.id]);

  //     return true;
  //   } catch(e) {
  //     Logger.error(e);

  //     return false;
  //   }
  // }

  /**
   * 
   * @param propertyIdList 
   */
  private async deleteProperty(propertyIdList: string[]): Promise<boolean> {
    try {
      await this.propertyRepository.delete(propertyIdList);

      return true;
    } catch(e) {
      Logger.error(e);

      return false;
    }
  }

  // /**
  //  * 
  //  * @param blockUpdateProps 
  //  */
  // private async updateBlock(block: Block, blockUpdateProps: BlockUpdateProps): Promise<boolean> {

  //   for(const [key, value] of Object.entries(blockUpdateProps)) {
  //     if(key !== "id") {
  //       block[key] = value;
  //     }
  //   }

  //   await this.saveBlock([block]);

  //   return true;
  // }

  // /**
  //  * 
  //  * @param propertyUpdateProps 
  //  */
  // private async updateProperty(property: BlockProperty, propertyUpdateProps: PropertyUpdateProps): Promise<boolean> {

  //   for(const [key, value] of Object.entries(propertyUpdateProps)) {
  //     if(key !== "blockid") {
  //       property[key] = value;
  //     }
  //   }

  //   await this.saveProperty([property]);

  //   return true;
  // }

  private async insertBlockData(blockData: BlockData, page: Page): Promise<Block> {
    const property: BlockProperty = await this.insertProperty(blockData.property);

    const block: Block = await this.blockRepository.create(Object.assign({}, blockData, {
      page,
      property
    }));

    return block;
  }

  public async findBlockList(blockIdList: string[]): Promise<Block[]> {
    return await this.blockRepository.find({
      relations: ["property", "blockComment"],
      where: {
        id: In(blockIdList)
      }
    });
  }

  /**
   * 
   * @param page 
   */
  public async createBlockData(page: Page): Promise<BlockData> {
    const property: BlockProperty | null = await this.insertProperty({
      type: "bk-h1",
      styles: {
        color: null,
        backgroundColor: null
      },
      contents: []
    });

    property.id = Token.getUUID();

    if(!property) {
      return null;
    }

    console.log(property);

    const block: Block | null = await this.insertBlock({
      id: Token.getUUID(),
      page,
      property,
      children: []
    });

    if(!block) {
      this.deleteProperty([property.id]);
      return null;
    }

    const blockData: BlockData = Object.assign({}, block, {
      blockComment: undefined,
      page: undefined,
      property: Object.assign({}, property, {
        id: undefined
      })
    });

    return blockData;
  }

  /**
   * 
   * @param blockIdList 
   */
  public async removeBlockData(blockIdList: string[]): Promise<boolean> {
    const blockList = await this.blockRepository.find({
      relations: ["property", "blockComment"],
      where: {
        id: In(blockIdList)
      }
    });

    const data = {
      propertyList: [],
      commentList: []
    };

    console.log(blockList);

    for(const block of blockList) {
      console.log(block);

      if(block.blockComment[0]) {
        for(const comment of block.blockComment) {
          data.commentList.push(comment.id);
        }
      }

      data.propertyList.push(block.property.id);
    }

    try {
      await this.blockCommentRepository.delete(data.commentList);
      await this.deleteBlock(blockIdList);
      await this.deleteProperty(data.propertyList);

      return true;
    } catch(e) {
      Logger.error(e);

      return false;
    }
  }

  /**
   * 
   * @param paramModifyBlockList 
   * @param page 
   */
  public async createData(paramModifyBlockList: ParamCreateModifyBlock[], page: Page): Promise<ModifyData | null> {
    try {

      const data = {
        block: [],
        property: [],
        comment: []
      };

      for(const param of paramModifyBlockList) {

        if(param.set === "block") {
          const { payload } = param;

          const property: BlockProperty = await this.propertyRepository
            .create(Object.assign({}, payload.property, {
              id: Token.getUUID()
            }));

          property.id = Token.getUUID();

          data.property.push(property);
        
          const block: Block = await this.blockRepository
            .create(Object.assign({}, payload, { 
              property,
              page
            }));

          data.block.push(block);

        } else if(param.set === "comment") {
          const { blockId, payload } = param;

          const block: Block = await this.findOneBlock(blockId);
            
          if(!block) {
            return null;
          }

          const blockComment: BlockComment = await this.blockCommentRepository.create();
          
          blockComment.block = block;
          blockComment.page = page;
          blockComment.comment = payload;

          data.comment.push(blockComment);

        } else {
          return null;
        }
      }

      console.log(data);

      return data;

    } catch(e) {
      Logger.error(e);

      return null;
    }
  }


  /**
   * 
   * @param paramModifyBlockList 
   */
  public async updateData(paramModifyBlockList: ParamModifyBlock[]): Promise<ModifyData | null> {
    const idList = paramModifyBlockList.map((param) => {
      return param.blockId
    });

    try {
      const blockList: Block[] = await this.blockRepository.find({
        relations: ["property"],
        where: {
          id: In(idList)
        }
      });
  
      if(!blockList[0]) {
        return null;
      }

      const data: ModifyData = {
        block: [],
        property: [],
        comment: []
      };

      for(const { blockId, set, payload } of paramModifyBlockList) {
        const idx = blockList.findIndex((block) => block.id === blockId);
        console.log(blockList[idx]);

        switch(set) {
          case "block":
            if(payload.property) {
              data.property.push(Object.assign(blockList[idx].property, payload.property));
            }

            data.block.push(Object.assign(blockList[idx], payload, {
              property: undefined
            }));
            
          break;
          
          case "property":
            data.property.push(Object.assign(blockList[idx].property, payload));

          break;

          default: 
            return null;
        }
      }

      return data;
    } catch(e) {
      Logger.error(e);

      return null;
    }
  }

  /**
   * 
   * @param paramModifyBlockList 
   */
  public async deleteData(paramModifyBlockList: ParamModifyBlock[]): Promise<boolean> {
    const idList = paramModifyBlockList.map((param) => {
      return param.blockId
    });

    return await this.removeBlockData(idList);
  }

}
