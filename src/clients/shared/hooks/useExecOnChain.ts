import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";

type Status = { tone: 'info' | 'success' | 'error'; message: string };

export default function useExecOnChain() {
    const suiClient = useSuiClient();
    const [status, setStatus] = useState<Status | null>(null);
    const { mutate: signAndExecute } = useSignAndExecuteTransaction({
        execute: async ({ bytes, signature }) =>
          suiClient.executeTransactionBlock({
            transactionBlock: bytes,
            signature,
            options: {
              showEffects: true,
              showRawEffects: true,
              showObjectChanges: true,
            },
          }),
      });

  const exec = (
    tx: Transaction,
    gasBudget: bigint | number = 10000000, // 기본값 설정 가능
    onSuccess?: (result: SuiTransactionBlockResponse) => void
  ) => {
    tx.setGasBudget(gasBudget);
    setStatus({ tone: 'info', message: '트랜잭션을 전송합니다...' });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          const txStatus = result?.effects?.status?.status;
          if (txStatus !== 'success') {
            setStatus({
              tone: 'error',
              message: `실패했습니다.\n오류: ${result?.effects?.status?.error ?? '알 수 없는 오류'}`,
            });
            return;
          }
          setStatus({ tone: 'success', message: `✓ 성공` });
          onSuccess?.(result);
        },
        onError: (error) => {
          setStatus({
            tone: 'error',
            message: `에러 발생: ${error instanceof Error ? error.message : String(error)}`,
          });
        },
      }
    );
  };

  return { exec, status };
}