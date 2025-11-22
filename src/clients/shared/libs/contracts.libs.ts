import { Transaction } from "@mysten/sui/transactions";
import { fromHEX } from "@mysten/sui/utils";
import { ACCESS_POLICY_TYPE, ADMIN_CAP_TYPE, PACKAGE_ID } from "../config/contract.config";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";

export const createAccessPolicyTx = (
  initialRecruiter: string,
) => {
  const tx = new Transaction();

  tx.moveCall({
    target: `${PACKAGE_ID}::access_policy::create`,
    arguments: [
      tx.pure.address(initialRecruiter),
    ],
  });

  return tx;
};

export const addRecruiterTx = (
  policyId: string,
  adminCapId: string,
  recruiterAddress: string,
) => {
  const tx = new Transaction();

  // Sui TypeScript SDK에서 shared object를 mutable reference로 전달할 때는 추가 정보가 필요합니다
  // Shared object의 경우 객체 정보를 먼저 가져와야 합니다
  // 자동으로 shared object 감지
  tx.object(policyId);
  tx.moveCall({
    target: `${PACKAGE_ID}::access_policy::add_recruiter`,
    arguments: [
      tx.object(policyId),
      tx.object(adminCapId),
      tx.pure.address(recruiterAddress),
    ],
  });

  return tx;
};

export const sealApproveTx = (policyObjectId: string, encryptionId: string) => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::access_policy::seal_approve`,
    arguments: [
      tx.pure.vector("u8", fromHEX(encryptionId)),
      tx.object(policyObjectId)
    ],
  });

  return tx;
};

export const extractObjectIds = (result: SuiTransactionBlockResponse) => {
  const changes = result.objectChanges;

  let capId: string | null = null;
  let policyObjectId: string | null = null;

  if (!changes) {
    throw Error("No object changes found. Did you set showObjectChanges: true?");
  }

  for (const change of changes) {
    if (change.type === 'created') {
      if (change.objectType === ADMIN_CAP_TYPE) {
        capId = change.objectId;
      }
      else if (change.objectType === ACCESS_POLICY_TYPE) {
        policyObjectId = change.objectId;
      }
    }
  }

  if (!policyObjectId || !capId) {
    throw Error("AccessPolicy and AdminCap were not created successfully.");
  }

  return { policyObjectId, capId };
}