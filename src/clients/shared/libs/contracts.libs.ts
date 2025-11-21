import { Transaction } from "@mysten/sui/transactions";

const PACKAGE_ID = "0xc3f7a4d681174eb895a6c04759d4df014c298f19193c0382bf2d232f5fc7e995";

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

export const sealApproveTx = (policyId: string) => {
  const tx = new Transaction();

  tx.moveCall({
    target: `${PACKAGE_ID}::access_policy::seal_approve`,
    arguments: [
      tx.object(policyId),
    ],
  });

  return tx;
};