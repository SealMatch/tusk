"use client";

import {
  UploadState,
  useFileUpload,
} from "@/clients/shared/hooks/useFileUpload";
import { useSubmitApplicant } from "@/clients/shared/hooks/useSubmitApplicant";
import { Button } from "@/clients/shared/ui";
import { formatDate, formatFileSize } from "@/clients/shared/utils/file.utils";
import { useCurrentAccount } from "@mysten/dapp-kit";
import {
  Briefcase,
  CheckCircle2,
  Code2,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function SubmitPage() {
  const [handle, setHandle] = useState("");
  const [handleCheckStatus, setHandleCheckStatus] = useState<
    "idle" | "checking" | "available" | "duplicate"
  >("idle");
  const currentAccount = useCurrentAccount();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { file, error, uploadResult, state, handleFileChange, handleSubmit } =
    useFileUpload();

  const {
    submitApplicantAsync,
    isLoading: isSubmitting,
    isSuccess: submitSuccess,
    isError: hasSubmitError,
    error: submitError,
    reset: resetSubmit,
  } = useSubmitApplicant();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(event);
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDuplicateCheck = async (handle: string) => {
    if (!handle.trim()) {
      setHandleCheckStatus("idle");
      return;
    }

    try {
      setHandleCheckStatus("checking");
      const response = await fetch(`/api/v1/handle-check?handle=${handle}`);
      const result = await response.json();

      // data: true = 중복, data: false = 사용 가능
      if (result.success && !result.data) {
        setHandleCheckStatus("available");
      } else {
        setHandleCheckStatus("duplicate");
      }
    } catch (error) {
      console.error("핸들 중복 체크 오류:", error);
      setHandleCheckStatus("duplicate");
    }
  };

  // 1초 debounce로 자동 중복 체크
  useEffect(() => {
    if (!handle.trim()) {
      setHandleCheckStatus("idle");
      return;
    }

    const timer = setTimeout(() => {
      handleDuplicateCheck(handle);
    }, 1000);

    return () => clearTimeout(timer);
  }, [handle]);

  const [isAnalyzingPdf, setIsAnalyzingPdf] = useState(false);
  const [analyzingError, setAnalyzingError] = useState<string | null>(null);
  const [analyzingResult, setAnalyzingResult] = useState<{
    position: string;
    techStack: string[];
    aiSummary: string;
  } | null>(null);

  const handleSupplyClick = async () => {
    // Reset submit states
    resetSubmit();
    setAnalyzingError(null);

    // 1. 먼저 파일 업로드 (아직 업로드되지 않았다면)
    if (state !== "done") {
      await handleSubmit();
    }

    // 2. 업로드가 완료되지 않았으면 에러 처리
    if (state !== "done" || !uploadResult) {
      // 에러는 useFileUpload의 error state에서 처리됨
      return;
    }

    // 3. 필수 필드 검증
    if (!handle.trim() || !file) {
      return;
    }

    // 4. PDF 분석 API 호출
    let summaryData: {
      position: string;
      techStack: string[];
      aiSummary: string;
    } | null = null;
    try {
      setIsAnalyzingPdf(true);

      const formData = new FormData();
      formData.append("pdf", file);

      const response = await fetch("/api/v1/summary", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("PDF 분석 결과:", result);

      if (!result.success) {
        throw new Error(result.errorMessage || "PDF 분석에 실패했습니다.");
      }

      summaryData = result.data;
      setAnalyzingResult(summaryData);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "PDF 분석 중 오류가 발생했습니다.";
      console.error("PDF 분석 중 오류:", error);
      setAnalyzingError(errorMessage);
      setIsAnalyzingPdf(false);
      setAnalyzingResult(null);
      return;
    } finally {
      setIsAnalyzingPdf(false);
    }

    // 5. summaryData 확인
    if (!summaryData) {
      setAnalyzingError("PDF 분석 결과를 받지 못했습니다.");
      return;
    }

    // 6. 지원자 등록 API 호출
    try {
      await submitApplicantAsync({
        handle: handle.trim(),
        walletAddress: currentAccount?.address ?? "",
        position: summaryData.position,
        techStack: summaryData.techStack,
        aiSummary: summaryData.aiSummary,
        blobId: uploadResult.blobId,
        capId: uploadResult.capId,
        sealPolicyId: uploadResult.policyObjectId,
        encryptionId: uploadResult.encryptionId,
        accessPrice: 0, // TODO: 가격 설정 UI 추가 시 교체
        isJobSeeking: true,
      });

      // 폼 초기화 (선택사항)
      // setHandle("");
    } catch (error) {
      // 에러는 useMutation에서 자동으로 처리됨
      console.error("지원자 등록 중 오류:", error);
    }
  };

  // 업로드 상태 정보
  const getUploadStateInfo = (
    currentState: UploadState
  ): { label: string; progress: number } => {
    const stateMap: Record<UploadState, { label: string; progress: number }> = {
      empty: { label: "대기 중", progress: 0 },
      encrypting: { label: "파일 암호화 중...", progress: 15 },
      encoding: { label: "인코딩 중...", progress: 30 },
      encoded: { label: "인코딩 완료", progress: 45 },
      registering: { label: "블록체인 등록 중...", progress: 60 },
      uploading: { label: "업로드 중...", progress: 75 },
      uploaded: { label: "업로드 완료", progress: 85 },
      certifying: { label: "인증 중...", progress: 95 },
      done: { label: "완료!", progress: 100 },
    };
    return stateMap[currentState];
  };

  const isUploading = state !== "empty" && state !== "done";
  const uploadStateInfo = getUploadStateInfo(state);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-white">
            Start as a job seeker!
          </h1>
          <div className="mb-8 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

          {/* Form Container */}
          <div className="overflow-hidden rounded-xl border border-white/20 bg-black/30 backdrop-blur-xl shadow-2xl">
            <div className="p-6 sm:p-8">
              <h2 className="mb-6 text-2xl font-semibold text-white">
                Apply Form
              </h2>

              <div className="space-y-6">
                {/* 1. PDF 파일 업로드 */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    1. 이력서 PDF 파일
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handleFileButtonClick}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                    >
                      <Upload className="w-4 h-4" />
                      PDF 업로드
                    </Button>
                    {file && (
                      <span className="text-sm text-gray-300">{file.name}</span>
                    )}
                  </div>

                  {/* File Metadata Display */}
                  {file && (
                    <div className="mt-4 p-4 rounded-lg bg-black/40 border border-purple-500/30">
                      <h3 className="text-sm font-semibold text-purple-400 mb-3">
                        파일 정보
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">파일명:</span>
                          <span className="text-sm text-white font-medium">
                            {file.name}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">
                            파일 크기:
                          </span>
                          <span className="text-sm text-white">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">
                            파일 타입:
                          </span>
                          <span className="text-sm text-white">
                            {file.type || "application/pdf"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">
                            최종 수정:
                          </span>
                          <span className="text-sm text-white">
                            {formatDate(file.lastModified)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Upload Progress Display */}
                  {isUploading && (
                    <div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/50 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                        <span className="text-sm font-semibold text-purple-300">
                          {uploadStateInfo.label}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-black/50 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-500 ease-out rounded-full"
                          style={{ width: `${uploadStateInfo.progress}%` }}
                        >
                          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        </div>
                      </div>

                      <div className="mt-2 text-right">
                        <span className="text-xs text-purple-300 font-medium">
                          {uploadStateInfo.progress}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Upload Success Display */}
                  {state === "done" && uploadResult && (
                    <div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/50 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-sm font-semibold text-green-300">
                          업로드 완료!
                        </span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="text-gray-400">
                          Blob ID:{" "}
                          <span className="text-green-300 font-mono">
                            {uploadResult.blobId.slice(0, 20)}...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {error && (
                    <div className="mt-4 p-4 rounded-lg bg-red-900/30 border border-red-500/50 backdrop-blur-sm">
                      <p className="text-sm text-red-300">⚠️ {error}</p>
                    </div>
                  )}
                </div>

                {/* PDF Analysis Error Display */}
                {analyzingError && (
                  <div className="p-4 rounded-lg bg-red-900/30 border border-red-500/50 backdrop-blur-sm">
                    <p className="text-sm text-red-300">⚠️ {analyzingError}</p>
                  </div>
                )}

                {/* Submit Error Display */}
                {hasSubmitError && submitError && (
                  <div className="p-4 rounded-lg bg-red-900/30 border border-red-500/50 backdrop-blur-sm">
                    <p className="text-sm text-red-300">
                      ⚠️ {submitError.message}
                    </p>
                  </div>
                )}

                {/* Submit Success Display */}
                {submitSuccess && (
                  <div className="p-4 rounded-lg bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="text-sm font-semibold text-green-300">
                        지원이 성공적으로 등록되었습니다! 🎉
                      </span>
                    </div>
                  </div>
                )}

                {/* 2. 본인 핸들 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium text-white">
                      2. 본인 핸들
                    </label>
                    {handleCheckStatus === "checking" && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>확인 중...</span>
                      </div>
                    )}
                    {handleCheckStatus === "duplicate" && (
                      <div className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20">
                        <span>⚠️ 이미 사용 중인 핸들입니다</span>
                      </div>
                    )}
                    {handleCheckStatus === "available" && (
                      <div className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>사용 가능한 핸들입니다</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={handle ? `@${handle}` : ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      // @ 제거하고 저장
                      const withoutAt = value.replace(/^@+/, "");
                      setHandle(withoutAt);
                    }}
                    className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="@핸들을 입력하세요"
                  />
                </div>

                {/* 3. AI 요약 정보 */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    3. AI 요약
                  </label>
                  <div className="p-4 rounded-lg bg-black/40 border border-purple-500/30">
                    {!analyzingResult ? (
                      <div className="flex items-center gap-3 text-gray-400 py-2">
                        <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                        <p className="text-sm">
                          제출 시 업로드된 PDF를 AI가 분석하여 자동으로 직무,
                          기술 스택, 요약을 생성합니다.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Position */}
                        <div className="flex items-start gap-4 group">
                          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xs font-medium text-purple-300/70 uppercase tracking-wider mb-1">
                              Target Position
                            </h4>
                            <p className="text-lg font-semibold text-white tracking-tight">
                              {analyzingResult.position}
                            </p>
                          </div>
                        </div>

                        {/* Tech Stack */}
                        <div className="flex items-start gap-4 group">
                          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                            <Code2 className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xs font-medium text-blue-300/70 uppercase tracking-wider mb-2">
                              Tech Stack
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {analyzingResult.techStack.map((tech, i) => (
                                <span
                                  key={i}
                                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Summary */}
                        <div className="flex items-start gap-4 group">
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xs font-medium text-emerald-300/70 uppercase tracking-wider mb-2">
                              AI Analysis
                            </h4>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 leading-relaxed">
                              {analyzingResult.aiSummary}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Supply 버튼 */}
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSupplyClick}
                    disabled={
                      isSubmitting ||
                      isUploading ||
                      isAnalyzingPdf ||
                      !file ||
                      !handle.trim()
                    }
                    className={`px-8 py-3 rounded-lg font-medium flex items-center gap-2 ${
                      isSubmitting ||
                      isUploading ||
                      isAnalyzingPdf ||
                      !file ||
                      !handle.trim()
                        ? "bg-gray-600 cursor-not-allowed opacity-50"
                        : "bg-blue-600 hover:bg-blue-700"
                    } text-white`}
                  >
                    {(isSubmitting || isUploading || isAnalyzingPdf) && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    {isAnalyzingPdf
                      ? "PDF 분석 중..."
                      : isSubmitting
                      ? "제출 중..."
                      : isUploading
                      ? "업로드 중..."
                      : "Supply"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
