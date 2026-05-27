// ============================================================================
// ClaimShield AI - Lightweight Permissioned Blockchain Simulation Layer
// ============================================================================

import * as crypto from 'crypto';
import prisma from '../config/database';

export interface BlockData {
  recordId: string;
  fileHash: string;
  uploadedBy: string;
  action: 'UPLOAD' | 'VERIFY' | 'DELETE' | 'UPDATE';
}

export class Block {
  public index: number;
  public timestamp: string;
  public data: BlockData;
  public previousHash: string;
  public hash: string;
  public nonce: number;

  constructor(
    index: number,
    timestamp: string,
    data: BlockData,
    previousHash: string,
    hash: string = '',
    nonce: number = 0
  ) {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = nonce;
    this.hash = hash || this.calculateHash();
  }

  /**
   * Calculates the SHA-256 hash of the block contents
   */
  public calculateHash(): string {
    const dataStr = JSON.stringify(this.data);
    const content = `${this.index}${this.timestamp}${dataStr}${this.previousHash}${this.nonce}`;
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Simplified Proof of Work (mining) to simulate blockchain security
   */
  public mineBlock(difficulty: number): void {
    const target = Array(difficulty + 1).join('0');
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

class Blockchain {
  private chain: Block[] = [];
  private difficulty = 2; // Simulates mining. Requires block hash to start with "00"
  private isInitialized = false;

  constructor() {}

  /**
   * Initializes the blockchain by pulling persisted blocks from the database
   * or creating the genesis block if the ledger is empty.
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const dbBlocks = await prisma.blockchainBlock.findMany({
        orderBy: { index: 'asc' },
      });

      if (dbBlocks.length > 0) {
        this.chain = dbBlocks.map((b) => {
          // Prisma stores the SHA-256 file hash directly in `fileHash`.
          // We must reconstruct the block payload from individual columns.
          const blockData: BlockData = {
            recordId: b.recordId || '',
            fileHash: b.fileHash,
            uploadedBy: b.uploadedBy || 'SYSTEM',
            action: b.action as any,
          };

          return new Block(
            b.index,
            new Date(b.timestamp).toISOString(),
            blockData,
            b.previousHash,
            b.hash,
            b.nonce
          );
        });
        console.log(`Loaded blockchain from database: ${this.chain.length} blocks.`);
      } else {
        console.log('No blockchain ledger found in DB. Building genesis block...');
        const genesis = this.createGenesisBlock();
        await this.persistBlock(genesis);
        this.chain.push(genesis);
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing blockchain from database:', error);
      // In-memory fallback if database connection is not ready or failing
      if (this.chain.length === 0) {
        this.chain.push(this.createGenesisBlock());
      }
      this.isInitialized = true;
    }
  }

  private createGenesisBlock(): Block {
    const genesisData: BlockData = {
      recordId: '00000000-0000-0000-0000-000000000000',
      fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // SHA-256 of empty string
      uploadedBy: 'SYSTEM',
      action: 'UPLOAD',
    };
    const block = new Block(0, new Date().toISOString(), genesisData, '0');
    block.mineBlock(this.difficulty);
    return block;
  }

  public getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Adds a new block to the blockchain after mining it.
   * Persists the block in both local RAM and the database.
   */
  public async addBlock(data: BlockData): Promise<Block> {
    await this.initialize();

    const latestBlock = this.getLatestBlock();
    const newBlock = new Block(
      latestBlock.index + 1,
      new Date().toISOString(),
      data,
      latestBlock.hash
    );

    console.log(`Mining Block ${newBlock.index}...`);
    newBlock.mineBlock(this.difficulty);
    console.log(`Block successfully mined! Hash: ${newBlock.hash}`);

    await this.persistBlock(newBlock);
    this.chain.push(newBlock);

    return newBlock;
  }

  /**
   * Persists a block to the database
   */
  private async persistBlock(block: Block): Promise<void> {
    try {
      await prisma.blockchainBlock.create({
        data: {
          index: block.index,
          timestamp: new Date(block.timestamp),
          recordId: block.data.recordId === '00000000-0000-0000-0000-000000000000' ? null : block.data.recordId,
          fileHash: block.data.fileHash,
          uploadedBy: block.data.uploadedBy,
          action: block.data.action,
          previousHash: block.previousHash,
          hash: block.hash,
          nonce: block.nonce,
        },
      });
    } catch (error) {
      console.error(`Failed to save Block ${block.index} in database:`, error);
    }
  }

  /**
   * Validates the integrity of the blockchain.
   * Compares block hashes and linkages.
   */
  public async isChainValid(): Promise<{ isValid: boolean; errorBlockIndex?: number }> {
    await this.initialize();

    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Re-calculate hash and check if it matches stored hash
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        console.warn(`Tampering detected at Block ${i}: calculated hash does not match stored hash.`);
        return { isValid: false, errorBlockIndex: i };
      }

      // Check linkage
      if (currentBlock.previousHash !== previousBlock.hash) {
        console.warn(`Tampering detected at Block ${i}: previousHash does not match previous block's hash.`);
        return { isValid: false, errorBlockIndex: i };
      }

      // Check if hash matches difficulty target
      const target = Array(this.difficulty + 1).join('0');
      if (currentBlock.hash.substring(0, this.difficulty) !== target) {
        console.warn(`Tampering detected at Block ${i}: hash does not satisfy difficulty requirement.`);
        return { isValid: false, errorBlockIndex: i };
      }
    }

    return { isValid: true };
  }

  /**
   * Checks if a medical record's hash matches the hash recorded on the blockchain
   */
  public async verifyRecord(recordId: string, fileHash: string): Promise<{
    verified: boolean;
    block?: Block;
    tamperingDetected: boolean;
  }> {
    await this.initialize();

    // Find the block associated with this recordId
    const block = this.chain.find((b) => b.data.recordId === recordId);

    if (!block) {
      return { verified: false, tamperingDetected: false };
    }

    // Verify file hash match
    const fileHashMatch = block.data.fileHash === fileHash;

    // Check overall chain integrity
    const chainIntegrity = await this.isChainValid();

    return {
      verified: fileHashMatch && chainIntegrity.isValid,
      block,
      tamperingDetected: !fileHashMatch || !chainIntegrity.isValid,
    };
  }

  /**
   * Return the entire chain
   */
  public async getChain(): Promise<Block[]> {
    await this.initialize();
    return this.chain;
  }
}

const blockchainInstance = new Blockchain();
export default blockchainInstance;
