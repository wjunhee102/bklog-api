import { Injectable, Logger } from '@nestjs/common';
import { BlockRepository } from './repositories/block.repository';
import { RequiredBlock, BlockData } from './block.type';
import { Block } from 'src/entities/bklog/block.entity';
import { Token } from 'src/utils/common/token.util';
import { Page } from 'src/entities/bklog/page.entity';
import { In, QueryRunner } from 'typeorm';
import { BlockCommentRepository } from './repositories/block-comment.repository';
import { CreateModifyBlockGenericType, DeleteModifyBlockData, ModifyBlockData, RawModifyData, UpdateModifyBlockGenericType } from '../bklog.type';
import { BlockComment } from 'src/entities/bklog/block-comment.entity';
import { BAD_REQ, ComposedResponseErrorType } from 'src/utils/common/response.util';
import { BklogErrorMessage } from '../utils';
import { BlockDataLength } from './type';

@Injectable()
export class BlockService {
  constructor(
    private readonly blockRepository   : BlockRepository,
    private readonly blockCommentRepository: BlockCommentRepository
  ){}
  
  public createBlock(requiredBlock: RequiredBlock): Block {
    const block: Block = this.blockRepository.create(requiredBlock);

    return block;
  }

  /**
   * block id
   * @param id 
   */
  private async findOneBlock(id: string) {
    return await this.blockRepository.findOne({ where: { id } });
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

  private async save<T = any> (queryRunner: QueryRunner, data: T) {
    await queryRunner.manager.save(data);
  }

  /**
   * 
   * @param requiredBlock 
   */
  private async insertBlock(requiredBlock: RequiredBlock) {
    const block: Block = await this.blockRepository.create(requiredBlock);

    await this.saveBlock([block]);

    return await this.findOneBlock(block.id);
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

  private async insertBlockData(blockData: BlockData, page: Page): Promise<Block> {

    const block: Block = await this.blockRepository.create(Object.assign({}, blockData, { page }));

    return block;
  }

  public async findBlockList(blockIdList: string[]): Promise<Block[]> {
    return await this.blockRepository.find({
      relations: ["blockComment"],
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
    const block: Block = this.createBlock({
      id: Token.getUUID(),
      styleType: "bk-p",
      styles: {
        color: null,
        backgroundColor: null
      },
      contents: [],
      page
    });

    return block;
  }

  /**
   * 
   * @param blockIdList 
   */
  public async removeBlockData(blockIdList: string[]): Promise<boolean> {
    const blockList = await this.findBlockList(blockIdList);

    const blockCommentList: string[] = [];

    for(const block of blockList) {

      if(block.blockComments[0]) {
        for(const comment of block.blockComments) {
          blockCommentList.push(comment.id);
        }
      }
    }

    try {
      await this.blockCommentRepository.delete(blockCommentList);
      await this.deleteBlock(blockIdList);

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
  public async createBlockDataList(createModifyBlockDataList: RawModifyData<CreateModifyBlockGenericType>[], page: Page): Promise<Block[] | null> {
    try {

      const blockList: Block[] = [];

      for(const data of createModifyBlockDataList) {

        const { payload } = data;

        if(Object.keys(payload).length !== BlockDataLength) return null;
      
        const block: Block = this.blockRepository
          .create({
            ...payload,
            page
          });

        blockList.push(block);
      }

      return blockList;

    } catch(e) {
      Logger.error(e);

      return null;
    }
  }

  /**
   * 
   * @param paramModifyBlockList 
   */
  public async updateBlockDataList(updateModifyBlockDataList: RawModifyData<UpdateModifyBlockGenericType>[]): Promise<Block[] | null> {
    const blockIdList = updateModifyBlockDataList.map(data => data.id);

    try {
      const blockList = await this.blockRepository.find({
        where: {
          id: In(blockIdList)
        }
      });
  
      if(!blockList[0]) {
        return null;
      }

      const newBlockList: Block[] = [];

      for(const data of updateModifyBlockDataList) {
        const idx = blockList.findIndex((block) => block.id === data.id);

        if(idx === -1) return null;
        blockList[idx].updateData(data);
        newBlockList.push(blockList[idx]);
      }

      if(blockList.length !== newBlockList.length) return null;

      return newBlockList;
    } catch(e) {
      Logger.error(e);

      return null;
    }
  }

  /**
   * 
   * @param paramModifyBlockList 
   */
  public async deleteData(deleteModifyBlockDataList: DeleteModifyBlockData[]): Promise<boolean> {
    const idList = deleteModifyBlockDataList.map((data) => {
      return data.id
    });

    return await this.removeBlockData(idList);
  }

  /**
   * 
   * @param queryRunner 
   * @param page 
   * @param modifyBlockData 
   * @returns 
   */
  public async updateModifyBlockData(
    queryRunner: QueryRunner, 
    page: Page,
    modifyBlockData: ModifyBlockData
  ): Promise<ComposedResponseErrorType | null> {

    const newBlockList: Block[] = [];

    if(modifyBlockData.create) {
      const blockList = await this.createBlockDataList(modifyBlockData.create, page);

      if(!blockList) return [new BklogErrorMessage().preBuild("client error", "create data error", "005"), BAD_REQ];

      newBlockList.push(...blockList);
    }

    if(modifyBlockData.update) {
      const blockList = await this.updateBlockDataList(modifyBlockData.update);

      if(!blockList) return [new BklogErrorMessage().preBuild("client error", "update data error", "005"), BAD_REQ];

      newBlockList.push(...blockList);
    }
    
    if(newBlockList[0]) await queryRunner.manager.save(newBlockList);

    if(modifyBlockData.delete) {
      const blockIdList: string[] = [];

      for(const { id } of modifyBlockData.delete) {
        blockIdList.push(id);
      }

      if(!blockIdList[0]) return BklogErrorMessage.notFound;

      const blockCommentIdList = await queryRunner.manager.find(BlockComment, {
        where: {
          block: {
            id: In(blockIdList)
          }
        }
      });  

      await queryRunner.manager.delete(Block, blockIdList);
      if(blockCommentIdList[0]) await queryRunner.manager.delete(BlockComment, blockCommentIdList);
    }

    return null;
  }

}
