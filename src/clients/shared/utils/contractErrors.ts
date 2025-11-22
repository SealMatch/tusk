/**
 * Sui 컨트랙트 에러 코드 매핑
 * 각 모듈별로 에러 코드와 메시지를 정의합니다.
 */

export interface ErrorCodeMapping {
    [moduleName: string]: {
        [errorCode: number]: string;
    };
}

// 에러 코드 매핑 정의 (Move 컨트랙트의 실제 에러 코드)
export const CONTRACT_ERROR_CODES: ErrorCodeMapping = {
    view_request: {
        100: "결제 금액이 부족합니다 (E_INSUFFICIENT_PAYMENT)",
        101: "잔액이 없습니다 (E_NO_BALANCE)",
        102: "후보가 아닙니다 (E_NOT_CANDIDATE)",
        103: "이미 처리된 요청입니다 (E_ALREADY_PROCESSED)",
    },
    // 공통 에러 (access_policy 또는 공통 모듈)
    common: {
        1: "권한이 없습니다 (E_NOT_ALLOWED)",
        2: "유효하지 않은 권한 객체입니다 (E_INVALID_CAP)",
        3: "유효하지 않은 수수료 비율입니다 (E_INVALID_FEE_PERCENT)",
        4: "중복된 주소입니다 (E_DUPLICATE_ADDRESS)",
    },
};

/**
 * 에러 코드를 사람이 읽을 수 있는 메시지로 변환
 */
export function getErrorMessage(
    moduleName: string,
    errorCode: number
): string | null {
    const moduleErrors = CONTRACT_ERROR_CODES[moduleName];
    if (!moduleErrors) return null;

    return moduleErrors[errorCode] || null;
}

/**
 * 에러 정보 인터페이스
 */
export interface ContractErrorInfo {
    message: string;
    code: number | null;
    moduleAddress?: string;
    moduleName?: string;
    functionName?: string;
    rawError?: string;
    friendlyMessage?: string;
}

/**
 * 에러 코드를 친화적인 메시지로 변환
 */
export function enrichErrorWithFriendlyMessage(
    error: ContractErrorInfo
): ContractErrorInfo {
    if (error.moduleName && error.code !== null) {
        const friendlyMessage = getErrorMessage(error.moduleName, error.code);
        if (friendlyMessage) {
            return {
                ...error,
                friendlyMessage,
                message: friendlyMessage,
            };
        }
    }

    return error;
}
