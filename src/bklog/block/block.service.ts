import { Injectable, Logger } from '@nestjs/common';
import { BlockRepository } from './repositories/block.repository';
import { RequiredBlock, RequiredBlockProperty, BlockData, BlockUpdateProps, PropertyUpdateProps, ModifyData } from './block.type';
import { Block } from 'src/entities/bklog/block.entity';
import { Token } from 'src/utils/base/token.util';
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
   * 
   * @param requiredProperty 
   */
  private createProperty(requiredProperty: RequiredBlockProperty): BlockProperty {
    const property: BlockProperty = this.propertyRepository.create(requiredProperty);
    
    property.id = Token.getUUID();

    return property;
  }
  
  private createBlock(requiredBlock: RequiredBlock): Block {
    const block: Block = this.blockRepository.create(requiredBlock);

    return block;
  }

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
  public createBlockData(page: Page): Block {

    const property: BlockProperty = this.createProperty({
      type: "bk-h1",
      styles: {
        color: null,
        backgroundColor: null
      },
      contents: []
    });

    const block: Block = this.createBlock({
      id: Token.getUUID(),
      page,
      property,
      children: []
    });

    return block;
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

    for(const block of blockList) {

      if(block.blockComments[0]) {
        for(const comment of block.blockComments) {
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

      const modifyData = {
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

          modifyData.property.push(property);
        
          const block: Block = await this.blockRepository
            .create(Object.assign({}, payload, { 
              property,
              page
            }));

          modifyData.block.push(block);

        } else if(param.set === "comment") {
          const { blockId, payload } = param;

          const block: Block = await this.findOneBlock(blockId);
            
          if(!block) {
            return null;
          }

          const blockComment: BlockComment = await this.blockCommentRepository.create();
          
          blockComment.block = block;
          blockComment.page = page;
          blockComment.comments = payload;

          modifyData.comment.push(blockComment);

        } else {
          return null;
        }
      }

      return modifyData;

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
    const blockIdList = paramModifyBlockList
      .filter(({ set }) => set === "block" || set === "property")
      .map(({ blockId }) => blockId);

    try {
      const blockList: Block[] = await this.blockRepository.find({
        relations: ["property"],
        where: {
          id: In(blockIdList)
        }
      });
  
      if(!blockList[0]) {
        return null;
      }

      const modifyData: ModifyData = {
        block: [],
        property: [],
        comment: []
      };

      for(const { blockId, set, payload } of paramModifyBlockList) {
        const idx = blockList.findIndex((block) => block.id === blockId);

        switch(set) {
          case "block":
            if(payload.property) {
              modifyData.property.push(Object.assign(blockList[idx].property, payload.property));
            }

            if(payload.styles || payload.contents) {
              return null;
            }

            modifyData.block.push(Object.assign(blockList[idx], payload, {
              property: undefined
            }));
            
          break;
          
          case "property":
            modifyData.property.push(Object.assign(blockList[idx].property, payload));

          break;

          default: 
            return null;
        }
      }

      return modifyData;
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
