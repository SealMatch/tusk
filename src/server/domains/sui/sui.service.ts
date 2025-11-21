import { SuiClient } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { TransactionBlock } from "@mysten/sui.js/transactions";

const PACKAGE_ID = '0xb35fbef347e1a4ea13adb7bd0f24f6c9e82117f5715da28dbf8924539bd2178a';
const MODULE_NAME = 'access_policy';

class SuiService {
  private readonly client: SuiClient;
  private readonly keypair: Ed25519Keypair;


  constructor() {
    this.client = new SuiClient({
      url: "https://fullnode.testnet.sui.io:443",
    });
    this.keypair = Ed25519Keypair.deriveKeypair(process.env.SERVER_PRIVATE_KEY as string);
  }

// 1. Create Access Policy
async createAccessPolicy(initialRecruiter: string) {
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAME}::create`,
    arguments: [
      tx.pure(initialRecruiter, 'address')
    ],
  });

  const result = await this.client.signAndExecuteTransactionBlock({
    signer: this.keypair,
    transactionBlock: tx,
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });

  console.log('Policy created:', result);
  return result;
}

// 2. Add Recruiter
async function addRecruiter(
  policyId: string,
  adminCapId: string,
  recruiterAddress: string
) {
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAME}::add_recruiter`,
    arguments: [
      tx.object(policyId),
      tx.object(adminCapId),
      tx.pure(recruiterAddress, 'address')
    ],
  });

  const result = await this.client.signAndExecuteTransactionBlock({
    signer: this.keypair ,
    transactionBlock: tx,
  });

  console.log('Recruiter added:', result);
  return result;
}

// 3. Create View Request
async function createViewRequest(
  recruiterAddress: string,
  candidateId: string
) {
  const tx = new TransactionBlock();

  // Convert candidateId to vector<u8>
  const candidateIdBytes = Array.from(
    new TextEncoder().encode(candidateId)
  );

  tx.moveCall({
    target: `${PACKAGE_ID}::view_request::create`,
    arguments: [
      tx.pure(recruiterAddress, 'address'),
      tx.pure(candidateIdBytes, 'vector<u8>')
    ],
  });

  const result = await client.signAndExecuteTransactionBlock({
    signer: keypair,
    transactionBlock: tx,
  });

  console.log('View request created:', result);
  return result;
}

// 4. Approve View Request
async function approveViewRequest(requestId: string) {
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::view_request::approve`,
    arguments: [
      tx.object(requestId)
    ],
  });

  const result = await client.signAndExecuteTransactionBlock({
    signer: keypair,
    transactionBlock: tx,
  });

  console.log('Request approved:', result);
  return result;
}

// 5. Query Access Policy
async function getAccessPolicy(policyId: string) {
  const policy = await client.getObject({
    id: policyId,
    options: {
      showContent: true,
    },
  });

  console.log('Access Policy:', policy);
  return policy;
}

export const suiService = new SuiService();
