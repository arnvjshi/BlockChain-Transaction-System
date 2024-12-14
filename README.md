# Blockchain Transaction System Implementation

This project demonstrates the implementation of a basic blockchain with a transaction system. It uses JavaScript and the `crypto-js` library to manage transactions and ensure blockchain integrity through hashing and encryption.

## Project Overview

The goal of this project is to implement a transaction system in a blockchain using JavaScript. The system handles the validation and storage of transactions in blocks. The project relies on the `crypto-js` library to create hashes for securing transaction data.

## Features

- **Transaction Validation**: Each transaction is validated before being added to the blockchain.
- **Block Creation**: Transactions are grouped into blocks and added to the blockchain.
- **Hashing**: Each transaction is hashed using `crypto-js` for secure validation.
- **Simple Blockchain Structure**: The blockchain stores a series of blocks, each containing a list of transactions.

## Getting Started

To get started with this project locally, follow these steps:

### Prerequisites

Make sure you have the following installed:

- Node.js (v12.0 or higher)
- Git
- `crypto-js` library

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/arnvjshi/BlockChain-Transaction-System.git
    cd BlockChain-Transaction-System
    ```

2. Install dependencies:

    ```bash
    npm install crypto-js
    ```

3. Run the `transaction.js` script:

    ```bash
    node transaction.js
    ```

## Code Explanation

- **transaction.js**: Contains the core logic for transaction handling, including transaction validation, block creation, and hashing.

## Example Usage

Here’s an example of how to create a new transaction and add it to the blockchain:

```javascript
const crypto = require('crypto-js');

// Create a new transaction class
class Transaction {
  constructor(sender, recipient, amount) {
    this.sender = sender;
    this.recipient = recipient;
    this.amount = amount;
    this.timestamp = Date.now();
  }

  // Method to generate a transaction hash
  getTransactionHash() {
    return crypto.SHA256(this.sender + this.recipient + this.amount + this.timestamp).toString();
  }
}

// Example of creating a new transaction
const transaction = new Transaction("Alice", "Bob", 100);

// Log the transaction and its hash
console.log("Transaction:", transaction);
console.log("Transaction Hash:", transaction.getTransactionHash());
