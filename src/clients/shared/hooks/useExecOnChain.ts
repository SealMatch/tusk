import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";
import { enrichErrorWithFriendlyMessage, getErrorMessage } from "../utils/contractErrors";

type Status = { tone: 'info' | 'success' | 'error'; message: string };

interface ParsedContractError {
  message: string;
  code: number | null;
  moduleAddress?: string;
  moduleName?: string;
  functionName?: string;
  rawError?: string;
  friendlyMessage?: string;
}

const parseContractError = (errorString?: string): ParsedContractError => {
  if (!errorString) return { message: "알 수 없는 오류", code: null };

  // MoveAbort 전체 패턴 매칭
  // 예: MoveAbort(MoveLocation { module: ModuleId { address: <addr>, name: Identifier("<name>") }, function: 0, instruction: 24, function_name: Some("<func>") }, <code>)
  const moveAbortMatch = errorString.match(
    /MoveAbort\(MoveLocation\s*\{\s*module:\s*ModuleId\s*\{\s*address:\s*([a-f0-9]+),\s*name:\s*Identifier\("([^"]+)"\)\s*\},.*?function_name:\s*Some\("([^"]+)"\).*?\},\s*(\d+)\)/
  );

  if (moveAbortMatch) {
    const [, moduleAddress, moduleName, functionName, errorCode] = moveAbortMatch;
    const code = parseInt(errorCode, 10);

    return {
      message: `컨트랙트 실행 오류 (Module: ${moduleName}::${functionName}, Code: ${code})`,
      code,
      moduleAddress,
      moduleName,
      functionName,
      rawError: errorString
    };
  }

  // 간단한 MoveAbort(..., <code>) 패턴 매칭
  const simpleMatch = errorString.match(/MoveAbort\(.*,\s*(\d+)\)/);
  if (simpleMatch && simpleMatch[1]) {
    return {
      message: `컨트랙트 실행 오류 (Code: ${simpleMatch[1]})`,
      code: parseInt(simpleMatch[1], 10),
      rawError: errorString
    };
  }

  return { message: errorString, code: null, rawError: errorString };
};

export default function useExecOnChain() {
  const suiClient = useSuiClient();
  const [status, setStatus] = useState<Status | null>(null);
  const { mutateAsync: signAndExecuteTx } = useSignAndExecuteTransaction({
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

  const exec = async (
    tx: Transaction,
    gasBudget: bigint | number = 10000000, // 기본값 설정 가능
    onSuccess?: (result: SuiTransactionBlockResponse) => void
  ): Promise<SuiTransactionBlockResponse> => {
    tx.setGasBudget(gasBudget);
    setStatus({ tone: 'info', message: '트랜잭션을 전송합니다...' });

    try {
      const result = await signAndExecuteTx({ transaction: tx });
      const txStatus = result?.effects?.status?.status;

      if (txStatus !== 'success') {
        const errorString = result?.effects?.status?.error;
        let parsedError = parseContractError(errorString);

        // 친화적인 메시지로 변환
        parsedError = enrichErrorWithFriendlyMessage(parsedError);

        // 모듈별 에러 메시지가 없으면 공통 에러 체크
        if (!parsedError.friendlyMessage && parsedError.code !== null) {
          const commonMessage = getErrorMessage('common', parsedError.code);
          if (commonMessage) {
            parsedError = {
              ...parsedError,
              friendlyMessage: commonMessage,
              message: commonMessage,
            };
          }
        }

        console.log('Contract Error:', {
          ...parsedError,
          rawError: errorString
        });

        const error = new Error(parsedError.message);
        Object.assign(error, {
          code: parsedError.code,
          moduleAddress: parsedError.moduleAddress,
          moduleName: parsedError.moduleName,
          functionName: parsedError.functionName,
          result
        });

        throw error;
      }

      onSuccess?.(result);
      return result;
    } catch (error) {
      setStatus({
        tone: 'error',
        message: `에러 발생: ${error instanceof Error ? error.message : String(error)}`,
      });
      throw error;
    }
  }

  return { exec, status };
}