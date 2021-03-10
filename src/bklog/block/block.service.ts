import { Injectable, Logger } from '@nestjs/common';
import { BlockRepository } from './repositories/block.repository';
import { TextPropertyRepository } from './repositories/text-property.repository';
import { InfoToFindBlock, BlockProperties, BaseBlockInfo, BasePropsInfo, TYPE_TEXT, BaseBlockDataInfo, PropsInfo, ResCreateBlockDate } from './block.type';
import { BlockTextProperty } from 'src/entities/bklog/text-property.entity';
import { Block } from 'src/entities/bklog/block.entity';
import { Token } from 'src/util/token.util';
import { BlockData } from './block.type';
import { BlockVersion } from 'src/entities/bklog/block-version.entity';
import { BlockVersionRepository } from './repositories/block-version.repository';

@Injectable()
export class BlockService {
  constructor(
    private readonly blockRepository : BlockRepository,
    private readonly textPropsRepository: TextPropertyRepository,
    private readonly versionRepository: BlockVersionRepository
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

  private async saveBlock(blocks: Block[]): Promise<boolean> {
    try {
      await this.blockRepository.save(blocks);

      return true;
    } catch(e) {
      Logger.error(e);

      return false;
    }
  }

  private async saveProperty(type: string, property: BlockProperties): Promise<boolean> {
    try {

      switch(type) {
        case TYPE_TEXT: 
          await this.textPropsRepository.save(property);
          console.log(property);
          return true;

        default:
          return false;
      }

    } catch(e) {
      Logger.error(e);
      return false;
    }
    
  }

  private async saveVersion(blockVersion: BlockVersion): Promise<boolean> {
    try {
      await this.versionRepository.save(blockVersion);

      return true;
    } catch(e) {
      Logger.error(e);

      return false;
    }
  }

  private async insertBlock(baseBlockInfo: BaseBlockInfo): Promise<Block> {
    try {
      const defaultBlockInfo = Object.assign({}, baseBlockInfo);

      if(!baseBlockInfo.children) {
        defaultBlockInfo.children = [];
      }

      const block: Block = await this.blockRepository.create(defaultBlockInfo);
      block.id = Token.getUUID();

      const result = await this.saveBlock([block]);
      console.log(result);
      if(!result) {
        return null;
      }

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
          const textDefaultProperty = {
            blockId,
            contents: [],
            style: {
              color: null,
              backgroundColor: null
            }
          }

          const textProps: BlockTextProperty = await this.textPropsRepository.create(Object.assign({}, textDefaultProperty, basePropsInfo.info)); 
          textProps.blockId = blockId;

          const result = await this.saveProperty(TYPE_TEXT, textProps);

          if(!result) {
            return null;
          }

          return textProps;
        
        default: 
          return null;
        
      }
    } catch (e) {
      Logger.error(e);
      return null;
    }
  }

  private async insertVersion(blockDataList: BlockData[], pageId: string,preVersionId?: string): Promise<string> {
    try {
      const blockVersion: BlockVersion = await this.versionRepository.create({preVersionId});
      
      blockVersion.id = Token.getUUID();
      blockVersion.pageId = pageId;
      blockVersion.blockDataList = blockDataList;
      
      await this.saveVersion(blockVersion);

      return blockVersion.id;
    } catch(e) {
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

  private async deleteVersion(blockVersion: BlockVersion) { 
    try {
      await this.versionRepository.delete(blockVersion);
      return true;
    } catch(e) {
      Logger.error(e);
      return false;
    }
  }

  public async createBlockData(baseBlockDataInfo: BaseBlockDataInfo): Promise<BlockData> {
    const block: Block = await this.insertBlock(baseBlockDataInfo.block);
    const props: BlockProperties = await this.insertProps(baseBlockDataInfo.props, block.id);

    if(block && props) {
      const blockData = Object.assign({}, block, {
        property: props
      });

      delete blockData.pageId;
      delete blockData.property.id;
      delete blockData.property.blockId;
  
      return blockData;

    } else if(block){
      await this.deleteBlock([block]);
    } 

    return null;
  }

  public async createFirstBlock(baseBlockInfo: BaseBlockInfo): Promise<ResCreateBlockDate> {
    const blockData: BlockData | null = await this.createBlockData({
      block: baseBlockInfo,
      props: {
        type: "text",
        info: {
          type: "bk-h1"
        }
      }
    });

    if(blockData) {
      const versionId: string = await this.insertVersion([blockData], baseBlockInfo.pageId);

      if(versionId) {
        return {
          blockData,
          versionId
        };
      }
      
    }
    
    return null;    
  }

  public async insertBlockData(blockData: BlockData, pageId: string): Promise<boolean> {
    const blockProperty: BlockProperties = Object.assign({}, blockData.property, {
      blockId: blockData.id,
      type: "text"
    });
    const block = Object.assign({}, blockData, {
      pageId
    });

    delete block.property;

    const resProps: boolean = await this.saveProperty(
      "text",
      blockProperty
    );

    const resBlock: boolean = await this.saveBlock([block]);

    if(resProps && resBlock) {
      return true;
    } else {
      if(resProps) {
        await this.deleteProps(blockProperty);
      } else {
        await this.deleteBlock([block]);
      }
    }

    return false;
  }

}
