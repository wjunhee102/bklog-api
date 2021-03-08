import { Injectable, Logger } from '@nestjs/common';
import { BlockRepository } from './repositories/block.repository';
import { TextPropertyRepository } from './repositories/text-property.repository';
import { InfoToFindBlock, BlockProperties, BaseBlockInfo, BasePropsInfo, TYPE_TEXT, BaseBlockDataInfo } from './block.type';
import { BlockTextProperty } from 'src/entities/bklog/text-property.entity';
import { Block } from 'src/entities/bklog/block.entity';
import { Token } from 'dist/src/util/token.util';
import { BlockData } from './block.type';

@Injectable()
export class BlockService {
  constructor(
    private readonly blockRepository : BlockRepository,
    private readonly textPropsRepository: TextPropertyRepository
  ){}

  private async findOneProperty(type: string, blockId: string): Promise<BlockProperties>{
    switch(type) {
      case "text": 
        return await this.textPropsRepository.findOne({
          where: {
            blockId
          }
        });
      default:
        return null;
    }
  }

  private async findOneBlock(blockInfo: InfoToFindBlock): Promise<Block> {
    return await this.blockRepository.findOne({
      where: blockInfo
    });
  }

  private async findBlock(blockInfo: InfoToFindBlock): Promise<Block[]> {
    return await this.blockRepository.find({
      where: blockInfo
    });
  }

  private async saveProperty(type: string, property: BlockProperties) {
    try {

      switch(type) {
        case "test": 
          await this.textPropsRepository.save(property);
          return true;

        default:
          return false;
      }

    } catch(e) {
      Logger.error(e);
      return false;
    }
    
  }

  private async saveBlock(blocks: Block[]) {
    try {
      await this.blockRepository.save(blocks);

      return true;
    } catch(e) {
      Logger.error(e);

      return false;
    }
  }

  private async insertBlock(baseBlockInfo: BaseBlockInfo): Promise<Block> {
    try {

      const block: Block = await this.blockRepository.create(baseBlockInfo);
      block.id = Token.getUUID();

      await this.saveBlock([block]);

      return block;
    } catch(e) {
      Logger.error(e);

      return null;
    }
  }

  private async insertProps(basePropsInfo: BasePropsInfo, blockId: string): Promise<BlockProperties> {
    try {
      switch(basePropsInfo.type) {
        case TYPE_TEXT: 
          const TextProps: BlockTextProperty = await this.textPropsRepository.create(basePropsInfo.info); 
          TextProps.blockId = blockId;

          return TextProps;
        
        default: 
          return null;
        
      }
    } catch (e) {
      Logger.error(e);
      return null;
    }
  }

  private async deleteBlock(block: Block[]): Promise<boolean> {
    try {
      await this.blockRepository.remove(block);
      return true;
    } catch(e) {
      Logger.error(e);
      return false;
    }
  }

  private async deleteProps(props: BlockProperties, type: string = TYPE_TEXT): Promise<boolean> {
    try {
      switch(type) {
        case TYPE_TEXT: 
          await this.textPropsRepository.remove(props);
          return true;
        
        default: 
          return false;
      } 
    } catch(e) {
      Logger.error(e);
      return false;
    }
  }

  public async createBlockData(baseBlockDataInfo: BaseBlockDataInfo): Promise<string> {
    const block: Block = await this.insertBlock(baseBlockDataInfo.block);
    const props: BlockProperties = await this.insertProps(baseBlockDataInfo.props, block.id);

    if(block && props) {
      return block.id;
    } else if(block){
      const result =  await this.deleteBlock([block]);
      console.log(result);
    } 
    return null;
  }

}
