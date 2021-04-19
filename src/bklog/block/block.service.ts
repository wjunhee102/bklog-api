import { Injectable, Logger } from '@nestjs/common';
import { BlockRepository } from './repositories/block.repository';
import { RequiredBlock, RequiredBlockProperty, BlockData, BlockUpdateProps, PropertyUpdateProps } from './block.type';
import { Block } from 'src/entities/bklog/block.entity';
import { Token } from 'src/util/token.util';
import { BlockPropertyRepository } from './repositories/block-property.repository';
import { BlockProperty } from 'src/entities/bklog/block-property.entity';
import { Page } from 'src/entities/bklog/page.entity';
import { In, Any } from 'typeorm';
import { BlockCommentRepository } from './repositories/block-comment.repository';
import { ModifySet, ParamModifyBlock } from '../bklog.type';
import { async } from 'rxjs';

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

    if(!requiredBlock.id) {
      block.id = Token.getUUID();
    }

    await this.saveBlock([block]);

    return await this.findOneBlock(block.id);
  }

  /**
   * 
   * @param requiredProperty 
   */
  private async insertProperty(requiredProperty: RequiredBlockProperty): Promise<BlockProperty> {
    const property: BlockProperty = await this.propertyRepository.create(requiredProperty);
    
    await this.saveProperty([property]);

    return await this.propertyRepository.findOne({
      where: {
        id: property.id
      }
    });
  }

  /**
   * 
   * @param block 
   */
  private async deleteBlock(block: Block): Promise<boolean> {
    try {
      await this.blockRepository.delete(block);

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
  private async deleteProperty(property: BlockProperty): Promise<boolean> {
    try {
      await this.propertyRepository.delete(property);

      return true;
    } catch(e) {
      Logger.error(e);

      return false;
    }
  }

  /**
   * 
   * @param blockUpdateProps 
   */
  private async updateBlock(block: Block, blockUpdateProps: BlockUpdateProps): Promise<boolean> {

    for(const [key, value] of Object.entries(blockUpdateProps)) {
      if(key !== "id") {
        block[key] = value;
      }
    }

    await this.saveBlock([block]);

    return true;
  }

  /**
   * 
   * @param propertyUpdateProps 
   */
  private async updateProperty(property: BlockProperty, propertyUpdateProps: PropertyUpdateProps): Promise<boolean> {

    for(const [key, value] of Object.entries(propertyUpdateProps)) {
      if(key !== "blockid") {
        property[key] = value;
      }
    }

    await this.saveProperty([property]);

    return true;
  }

  private async insertBlockData(blockData: BlockData, page: Page): Promise<boolean> {
    const property: BlockProperty = await this.insertProperty(blockData.property);

    console.log(property);

    const block: Block = await this.insertBlock(Object.assign({}, blockData, {
      page,
      property
    }));

    console.log(block);

    return block? true : false;
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

    if(!property) {
      return null;
    }

    const block: Block | null = await this.insertBlock({
      page,
      property,
      children: []
    });

    if(!block) {
      this.deleteProperty(property);
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
    try {
      const blockList = await this.blockRepository.find({
        relations: ["property", "blockComment"],
        where: {
          id: In(blockIdList)
        }
      });
  
      blockList.forEach(async (block)=> {
        if(block.blockComment[0]) {
          block.blockComment.forEach(async (comment)=> {
            await this.blockCommentRepository.delete(comment);
          });
        }

        await this.deleteBlock(block);
        await this.deleteProperty(block.property);
      });

      return true;
    } catch(e) {
      Logger.error(e);

      return false;
    }
  }

  /**
   * 
   * @param paramModifyBlockList 
   */
  public async createData(paramModifyBlockList: ParamModifyBlock[], page: Page): Promise<boolean> {
    paramModifyBlockList.forEach(async ({blockId, set, payload}) => {
      switch(set) {
        case "block":
          const resBlock: boolean = await this.insertBlockData(payload, page);

          if(!resBlock) {
            return false;
          }

          break;
        
        case "comment":
          console.log(blockId);

        default: 
          return false;
      }
    });

    return true;
  }

  /**
   * 
   * @param paramModifyBlockList 
   */
  public async updateData(paramModifyBlockList: ParamModifyBlock[]): Promise<boolean> {
    const idList = paramModifyBlockList.map((param) => {
      return param.blockId
    });

    console.log(idList);

    try {

      const blockList: Block[] = await this.blockRepository.find({
        relations: ["property"],
        where: {
          id: In(idList)
        }
      });

      console.log(blockList);
  
      if(!blockList[0]) {
        return false;
      }

      const data = {
        block: [],
        property: []
      };

      paramModifyBlockList.forEach(async ({blockId, set, payload}) => {
        const idx = blockList.findIndex((block) => block.id === blockId);
        console.log({blockId, set, payload}, idx);

        switch(set) {
          case "block":
            const resBlock: boolean = await this.saveBlock([Object.assign({}, blockList[idx], payload)]);

            if(!resBlock) {
              return false;
            }
          break;
          
          case "property":
            console.log(Object.assign({}, blockList[idx].property, payload));
            const resProperty: boolean = await this.saveProperty([Object.assign({}, blockList[idx].property, payload)]);

            if(!resProperty) {
              return false;
            }
          break;

          default: 
            return false;
        }

      });

    } catch(e) {
      Logger.error(e);

      return false;
    }

    return true;
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
