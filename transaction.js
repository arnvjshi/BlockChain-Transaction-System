// 1. Transaction Class Implementation
class Transaction {
    /**
     * Creates a new transaction
     * @param {string} fromAddress - The sender's address
     * @param {string} toAddress - The recipient's address
     * @param {number} amount - Amount to transfer
     */
    constructor(fromAddress, toAddress, amount) {
        // Allow special case for mining rewards
        if (fromAddress === null && toAddress && amount > 0) {
            this.fromAddress = 'MINING_REWARD';
            this.toAddress = toAddress;
            this.amount = amount;
            this.timestamp = new Date().toISOString();
            return;
        }

        // Validate input parameters
        if (!fromAddress || !toAddress || amount <= 0) {
            throw new Error('Invalid transaction parameters');
        }

        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.timestamp = new Date().toISOString();
    }

    /**
     * Calculate a unique hash for the transaction
     * @returns {string} Transaction hash
     */
    calculateHash() {
        return crypto
            .createHash('sha256')
            .update(this.fromAddress + this.toAddress + this.amount + this.timestamp)
            .digest('hex');
    }
}

// 2. Updated Block Class
class Block {
    /**
     * Creates a new block
     * @param {number} index - Block index 
     * @param {Date} timestamp - Block creation time
     * @param {Transaction[]} transactions - List of transactions
     * @param {string} previousHash - Hash of the previous block
     */
    constructor(index, timestamp, transactions, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    /**
     * Calculate block hash incorporating transactions
     * @returns {string} Block hash
     */
    calculateHash() {
        // Include transactions in hash calculation
        const transactionData = this.transactions
            .map(tx => tx.calculateHash())
            .join('');

        return crypto
            .createHash('sha256')
            .update(this.index + 
                    this.previousHash + 
                    this.timestamp + 
                    transactionData + 
                    this.nonce)
            .digest('hex');
    }

    /**
     * Perform proof of work to mine the block
     * @param {number} difficulty - Mining difficulty 
     */
    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log('Block mined: ' + this.hash);
    }
}

// 3. Blockchain Class with Transaction Validation
class Blockchain {
    /**
     * Initialize blockchain with genesis block
     */
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 10; // Reward for mining a block
        this.accountBalances = {}; // Track account balances
    }

    /**
     * Create the first block in the blockchain
     * @returns {Block} Genesis block
     */
    createGenesisBlock() {
        return new Block(0, new Date().toISOString(), [], '0');
    }

    /**
     * Get the latest block in the chain
     * @returns {Block} Most recent block
     */
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    /**
     * Validate a transaction before adding to pending transactions
     * @param {Transaction} transaction - Transaction to validate
     * @returns {boolean} Whether transaction is valid
     */
    validateTransaction(transaction) {
        // Allow mining reward transactions
        if (transaction.fromAddress === 'MINING_REWARD') {
            return true;
        }

        // Check transaction parameters
        if (!transaction.fromAddress || !transaction.toAddress) {
            console.error('Invalid transaction: Address missing');
            return false;
        }

        // Check sender's balance
        const senderBalance = this.getAccountBalance(transaction.fromAddress);
        if (senderBalance < transaction.amount) {
            console.error('Insufficient funds');
            return false;
        }

        return true;
    }

    /**
     * Get current balance for an account
     * @param {string} address - Account address
     * @returns {number} Account balance
     */
    getAccountBalance(address) {
        let balance = this.accountBalances[address] || 0;
        
        // Calculate balance by going through all transactions
        this.chain.forEach(block => {
            block.transactions.forEach(tx => {
                if (tx.fromAddress === address) {
                    balance -= tx.amount;
                }
                if (tx.toAddress === address) {
                    balance += tx.amount;
                }
            });
        });

        return balance;
    }

    /**
     * Add a new transaction to pending transactions
     * @param {Transaction} transaction - Transaction to add
     */
    addTransaction(transaction) {
        if (this.validateTransaction(transaction)) {
            this.pendingTransactions.push(transaction);
        }
    }

    /**
     * Mine pending transactions and add to blockchain
     * @param {string} miningRewardAddress - Address to receive mining reward
     */
    minePendingTransactions(miningRewardAddress) {
        // Create a new block with pending transactions
        const block = new Block(
            this.chain.length, 
            new Date().toISOString(), 
            this.pendingTransactions, 
            this.getLatestBlock().hash
        );

        // Mine the block
        block.mineBlock(this.difficulty);

        // Add block to chain
        this.chain.push(block);

        // Reset pending transactions and add mining reward
        const rewardTx = new Transaction(
            null, 
            miningRewardAddress, 
            this.miningReward
        );
        this.pendingTransactions = [rewardTx];
    }

    /**
     * Validate entire blockchain
     * @returns {boolean} Whether blockchain is valid
     */
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Validate block hash
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            // Validate link between blocks
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

// Demonstration of Blockchain Transaction System
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ... (previous code remains the same)

function demonstrateBlockchain() {
    const blockchain = new Blockchain();

    // Prefund accounts by mining 100 blocks
    console.log('Prefunding accounts by mining initial blocks...');
    const accounts = ['Alice', 'Bob', 'Charlie', 'MinerAddress'];
    accounts.forEach(account => {
        for (let i = 0; i <= 10; i++) {
            blockchain.minePendingTransactions(account);
        }
    });

    // Create sample transactions
    const tx1 = new Transaction('Alice', 'Bob', 5);
    const tx2 = new Transaction('Bob', 'Charlie', 3);
    const tx3 = new Transaction('Charlie', 'Alice', 2);

    // Add transactions to blockchain
    blockchain.addTransaction(tx1);
    blockchain.addTransaction(tx2);
    blockchain.addTransaction(tx3);

    // Mine a block with these transactions
    blockchain.minePendingTransactions('MinerAddress');

    // Prepare output object
    const output = {
        transactions: blockchain.chain[blockchain.chain.length - 1].transactions,
        blockchain: blockchain.chain,
        chainValidity: blockchain.isChainValid(),
        accountBalances: {
            Alice: blockchain.getAccountBalance('Alice'),
            Bob: blockchain.getAccountBalance('Bob'),
            Charlie: blockchain.getAccountBalance('Charlie'),
            MinerAddress: blockchain.getAccountBalance('MinerAddress')
        }
    };

    // Ensure output directory exists
    const outputDir = path.join(__dirname, 'transaction_output_(by Arnav Joshi)');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    // Generate unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const outputFilePath = path.join(outputDir, `transaction_output_${timestamp}.json`);

    // Write output to JSON file
    fs.writeFileSync(outputFilePath, JSON.stringify(output, null, 2), 'utf8');
    console.log(`Output saved to ${outputFilePath}`);

    // Print results to console
    console.log('\n--- Transactions in Block ---');
    output.transactions.forEach(tx => {
        console.log(JSON.stringify(tx, null, 2));
    });

    console.log('\n--- Blockchain JSON ---');
    console.log(JSON.stringify(output.blockchain, null, 2));

    console.log('\n--- Is Blockchain Valid? ---');
    console.log(output.chainValidity);

    console.log('\n--- Account Balances ---');
    Object.entries(output.accountBalances).forEach(([account, balance]) => {
        console.log(`${account}:`, balance);
    });
}

// Run the demonstration
demonstrateBlockchain();