import { Injectable, Logger } from '@nestjs/common';
import { BlockRepository } from './repositories/block.repository';
import { RequiredBlock, BlockData, BlockUpdateProps, ModifyData } from './block.type';
import { Block } from 'src/entities/bklog/block.entity';
import { Token } from 'src/utils/common/token.util';
import { Page } from 'src/entities/bklog/page.entity';
import { In, Connection, QueryRunner } from 'typeorm';
import { BlockCommentRepository } from './repositories/block-comment.repository';
import { ParamModifyBlock, ParamCreateModifyBlock, ParamCreateBlock, ParamCreateComment, ModifyBlockType } from '../bklog.type';
import { BlockComment } from 'src/entities/bklog/block-comment.entity';
import { BAD_REQ, ComposedResponseErrorType, ResponseError, ResponseErrorTypes, SystemErrorMessage } from 'src/utils/common/response.util';
import { BklogErrorMessage } from '../utils';

@Injectable()
export class BlockService {
  constructor(
    private readonly blockRepository   : BlockRepository,
    private readonly blockCommentRepository: BlockCommentRepository,
    private connection: Connection
  ){}
  
  public createBlock(requiredBlock: RequiredBlock): Block {
    const block: Block = this.blockRepository.create(requiredBlock);

    return block;
  }

  /**
   * block id
   * @param id 
   */
  private async findOneBlock(id: string): Promise<Block> {
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
  private async insertBlock(requiredBlock: RequiredBlock): Promise<Block> {
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
    const blockList = await this.blockRepository.find({
      relations: ["blockComment"],
      where: {
        id: In(blockIdList)
      }
    });

    const data = {
      commentList: []
    };

    for(const block of blockList) {

      if(block.blockComments[0]) {
        for(const comment of block.blockComments) {
          data.commentList.push(comment.id);
        }
      }
    }

    try {
      await this.blockCommentRepository.delete(data.commentList);
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
  public async createData(paramModifyBlockList: ParamCreateModifyBlock[], page: Page): Promise<ModifyData | null> {
    try {

      const modifyData = {
        block: [],
        comment: []
      };

      for(const param of paramModifyBlockList) {

        if(param.set === "block") {
          const { payload } = param;
        
          const block: Block = await this.blockRepository
            .create(Object.assign({}, payload, {
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
      .filter(({ set }) => set === "block")
      .map(({ blockId }) => blockId);

    try {
      const blockList: Block[] = await this.blockRepository.find({
        where: {
          id: In(blockIdList)
        }
      });
  
      if(!blockList[0]) {
        return null;
      }

      const modifyData: ModifyData = {
        block: [],
        comment: []
      };

      for(const { blockId, set, payload } of paramModifyBlockList) {
        const idx = blockList.findIndex((block) => block.id === blockId)

        switch(set) {
          case "block":
            // update block과 기존 block이 싱크가 안맞을때가 있음.
            modifyData.block.push(Object.assign(blockList[idx], payload));
            
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

  public async updateModifyBlockData(
    queryRunner: QueryRunner, 
    page: Page,
    modifyBlockDataList: ModifyBlockType
  ): Promise<ComposedResponseErrorType> {

    const modifyData: ModifyData = {
      block: [],
      comment: []
    }

    if(modifyBlockDataList.create) {
      const resCreate: ModifyData | null = await this.createData(modifyBlockDataList.create, page);

      if(!resCreate) {
        return [new BklogErrorMessage().preBuild("client error", "create data error", "005"), BAD_REQ]
      }

      if(resCreate.block) {
        modifyData.block = modifyData.block.concat(resCreate.block);
      }

      if(resCreate.comment) {
        modifyData.comment = modifyData.comment.concat(resCreate.comment);
      }
    }

    if(modifyBlockDataList.update) {
      const resUpdate: ModifyData | null = await this.updateData(modifyBlockDataList.update);

      if(!resUpdate) {
        return [new BklogErrorMessage().preBuild("client error", "update data error", "005"), BAD_REQ];
      }

      if(resUpdate.block) {
        modifyData.block = modifyData.block.concat(resUpdate.block);
      }

      if(resUpdate.comment) {
        modifyData.comment = modifyData.comment.concat(resUpdate.comment);
      }
    }

    if(modifyData.block[0]) await queryRunner.manager.save(modifyData.block);
    if(modifyData.comment[0]) await queryRunner.manager.save(modifyData.comment);

    if(modifyBlockDataList.delete) {
      const { commentIdList, blockIdList } = modifyBlockDataList.delete;

      if(commentIdList) await queryRunner.manager.delete(BlockComment, commentIdList);

      if(blockIdList) await queryRunner.manager.delete(Block, blockIdList);
      
    }

    return null;
  }

}
