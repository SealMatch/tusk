import { Transaction } from "@mysten/sui/transactions";
import { fromHEX } from "@mysten/sui/utils";
import { ACCESS_POLICY_TYPE, ADMIN_CAP_TYPE, PACKAGE_ID, VIEW_REQUEST_TYPE } from "../config/contract.config";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";

export const createAccessPolicyTx = (
  platformTreasury: string,
) => {
  const tx = new Transaction();

  tx.moveCall({
    target: `${PACKAGE_ID}::access_policy::create`,
    arguments: [
      tx.pure.address(platformTreasury),
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

export const createViewRequestTx = (
  policyObjectId: string,
  accessPrice: string, // MIST
) => {
  const tx = new Transaction();
  const paymentCoin = tx.splitCoins(tx.gas, [tx.pure.u64(accessPrice)]);

  tx.moveCall({
    target: `${PACKAGE_ID}::view_request::create`,
    arguments: [
      tx.object(policyObjectId),
      paymentCoin,
    ],
  });

  return tx;
}

export const approveViewRequestTx = (
  viewRequestId: string,
  policyObjectId: string,
  adminCapId: string,
) => {
  const tx = new Transaction();

  tx.moveCall({
    target: `${PACKAGE_ID}::view_request::approve`,
    arguments: [
      tx.object(viewRequestId),
      tx.object(policyObjectId),
      tx.object(adminCapId),
    ],
  });

  return tx;
}

export const rejectViewRequestTx = (
  viewRequestId: string,
  policyObjectId: string,
) => {
  const tx = new Transaction();

  tx.moveCall({
    target: `${PACKAGE_ID}::view_request::reject`,
    arguments: [
      tx.object(viewRequestId),
      tx.object(policyObjectId),
    ],
  });

  return tx;
}

const getCreatedObjectId = (
  changes: NonNullable<SuiTransactionBlockResponse["objectChanges"]>,
  type: string
) => {
  const change = changes.find(
    (change) => change.type === "created" && change.objectType === type
  );
  return change && "objectId" in change ? change.objectId : null;
};

export const extractAccessPolicyObjectIds = (
  result: SuiTransactionBlockResponse
) => {
  if (!result.objectChanges) {
    throw Error("No object changes found. Did you set showObjectChanges: true?");
  }

  const capId = getCreatedObjectId(result.objectChanges, ADMIN_CAP_TYPE);
  const policyObjectId = getCreatedObjectId(
    result.objectChanges,
    ACCESS_POLICY_TYPE
  );

  if (!policyObjectId || !capId) {
    throw Error("AccessPolicy and AdminCap were not created successfully.");
  }

  return { policyObjectId, capId };
};

export const extractViewRequestObjectIds = (
  result: SuiTransactionBlockResponse
) => {
  if (!result.objectChanges) {
    throw Error("No object changes found. Did you set showObjectChanges: true?");
  }

  const viewRequestId = getCreatedObjectId(
    result.objectChanges,
    VIEW_REQUEST_TYPE
  );

  if (!viewRequestId) {
    throw Error("ViewRequest was not created successfully.");
  }

  return { viewRequestId };
};
