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
  User,
  FileUp,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function SubmitPage() {
  const router = useRouter();
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

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    handleFileChange(event);

    // Auto upload + PDF analysis in parallel when file is selected
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Run in parallel
      const results = await Promise.allSettled([
        handleSubmit(selectedFile), // Walrus/Sui/Seal upload (direct file transfer)
        analyzePdf(selectedFile), // PDF AI analysis
      ]);

      const [uploadResultPromise, summaryResultPromise] = results;

      // Save results when PDF analysis succeeds
      if (summaryResultPromise.status === "fulfilled") {
        setAnalyzingResult(summaryResultPromise.value);
      } else {
        setAnalyzingError(
          "PDF analysis failed: " +
            (summaryResultPromise.reason instanceof Error
              ? summaryResultPromise.reason.message
              : "Unknown error")
        );
      }
    }
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

      // data: true = duplicate, data: false = available
      if (result.success && !result.data) {
        setHandleCheckStatus("available");
      } else {
        setHandleCheckStatus("duplicate");
      }
    } catch (error) {
      setHandleCheckStatus("duplicate");
    }
  };

  // Auto duplicate check with 1 second debounce
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

  // Navigate to main page on successful submission
  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 2000); // Move after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [submitSuccess, router]);

  const [isAnalyzingPdf, setIsAnalyzingPdf] = useState(false);
  const [analyzingError, setAnalyzingError] = useState<string | null>(null);
  const [analyzingResult, setAnalyzingResult] = useState<{
    position: string;
    techStack: string[];
    aiSummary: string;
  } | null>(null);

  // PDF analysis function (separated)
  const analyzePdf = async (
    pdfFile: File
  ): Promise<{
    position: string;
    techStack: string[];
    aiSummary: string;
  }> => {
    setIsAnalyzingPdf(true);

    try {
      const formData = new FormData();
      formData.append("pdf", pdfFile);

      const response = await fetch("/api/v1/summary", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.errorMessage || "PDF analysis failed.");
      }

      return result.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during PDF analysis.";
      setAnalyzingError(errorMessage);
      throw error;
    } finally {
      setIsAnalyzingPdf(false);
    }
  };

  // Convert to user-friendly error messages
  const getFriendlyErrorMessage = (errorMessage: string): string => {
    // File upload related errors
    if (errorMessage.includes("File size must be less than")) {
      return "File size exceeds 10MB. Please select a smaller file.";
    }
    if (errorMessage.includes("No file selected")) {
      return "Please select a file.";
    }
    if (errorMessage.includes("WAL 토큰이 부족합니다")) {
      return "Insufficient WAL tokens. Please add WAL tokens to your wallet.";
    }
    if (errorMessage.includes("접근 정책 생성 실패")) {
      return "Failed to create file access policy. Please try again.";
    }
    if (errorMessage.includes("파일 암호화 실패")) {
      return "File encryption failed. Please try again.";
    }
    if (errorMessage.includes("Walrus 업로드 실패")) {
      return "Failed to upload to file storage. Please check your network connection and try again.";
    }
    if (errorMessage.includes("Upload failed")) {
      return "File upload failed. Please try again.";
    }

    // PDF analysis related errors
    if (errorMessage.includes("PDF 분석 실패")) {
      return "Resume analysis failed. Please check if the PDF file is valid.";
    }

    // Database submission related errors
    if (
      errorMessage.includes("wallet_address") ||
      errorMessage.includes("duplicate key") ||
      errorMessage.includes("unique constraint")
    ) {
      return "This wallet address is already registered. Please try with a different wallet.";
    }
    if (errorMessage.includes("handle") && errorMessage.includes("unique")) {
      return "This handle is already in use. Please enter a different handle.";
    }

    // Default error message
    return errorMessage;
  };

  const handleSupplyClick = async () => {
    // Required data validation
    if (!uploadResult || !analyzingResult || !currentAccount?.address) {
      setAnalyzingError("Required data is missing. Please try again.");
      return;
    }

    try {
      resetSubmit();

      // Save applicant information to database
      await submitApplicantAsync({
        handle,
        walletAddress: currentAccount.address,
        position: analyzingResult.position,
        techStack: analyzingResult.techStack,
        aiSummary: analyzingResult.aiSummary,
        introduction: "",
        blobId: uploadResult.blobId,
        sealPolicyId: uploadResult.policyObjectId,
        encryptionId: uploadResult.encryptionId,
        capId: uploadResult.capId,
        isJobSeeking: true,
      });
    } catch (error) {
      // Errors are handled by useSubmitApplicant hook
      console.error(error);
    }
  };

  // Upload status information
  const getUploadStateInfo = (
    currentState: UploadState
  ): { label: string; progress: number } => {
    const stateMap: Record<UploadState, { label: string; progress: number }> = {
      empty: { label: "Waiting", progress: 0 },
      creating_policy: { label: "Creating access policy...", progress: 10 },
      encrypting: { label: "Encrypting file...", progress: 25 },
      encoding: { label: "Encoding...", progress: 40 },
      encoded: { label: "Encoding completed", progress: 45 },
      registering: { label: "Registering to blockchain...", progress: 60 },
      uploading: { label: "Uploading...", progress: 75 },
      uploaded: { label: "Upload completed", progress: 85 },
      certifying: { label: "Certifying...", progress: 95 },
      done: { label: "Complete!", progress: 100 },
    };
    return stateMap[currentState];
  };

  const isUploading = state !== "empty" && state !== "done";
  const uploadStateInfo = getUploadStateInfo(state);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white p-4 sm:p-8 relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">Join Our Talent Network</span>
          </div>
          <h1 className="mb-4 text-5xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent">
            Start as a job seeker!
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Upload your resume, create your profile, and get discovered by top recruiters worldwide.
          </p>
          <div className="mb-8 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

        </div>

        {/* Enhanced Form Container */}
        <div className="space-y-8">
          <div className="overflow-hidden rounded-2xl border border-white/20 bg-black/30 backdrop-blur-xl shadow-2xl">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                  <FileUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">1. Resume PDF</h3>
                  <p className="text-sm text-gray-400">Upload your resume for AI analysis</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Enhanced File Upload Section */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="flex flex-row items-center gap-4 justify-between">
                    <div className="flex flex-row items-center gap-2">
                      <Button
                        onClick={handleFileButtonClick}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                      >
                        <Upload className="w-4 h-4" />
                        PDF Upload
                      </Button>
                      {file && (
                        <span className="text-sm text-gray-300">
                          {file.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* File Metadata Display */}
                  {file && (
                    <div className="mt-4 p-4 rounded-lg bg-black/40 border border-purple-500/30">
                      <h3 className="text-sm font-semibold text-purple-400 mb-3">
                        File Information
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Filename:</span>
                          <span className="text-sm text-white font-medium">
                            {file.name}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">
                            File Size:
                          </span>
                          <span className="text-sm text-white">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">
                            File Type:
                          </span>
                          <span className="text-sm text-white">
                            {file.type || "application/pdf"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">
                            Last Modified:
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

                  {/* PDF Analysis Progress Display */}
                  {isAnalyzingPdf && (
                    <div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-500/50 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                        <span className="text-sm font-semibold text-emerald-300">
                          PDF AI Analysis in Progress...
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Upload Success Display */}
                  {state === "done" && uploadResult && !analyzingResult && (
                    <div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/50 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-sm font-semibold text-green-300">
                          Upload Complete!
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

                  {/* All Tasks Complete Display */}
                  {state === "done" && uploadResult && analyzingResult && (
                    <div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/50 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-sm font-semibold text-green-300">
                          All tasks completed! 🎉
                        </span>
                      </div>
                      <div className="mt-3 space-y-1 text-xs">
                        <div className="text-gray-400">
                          ✓ Upload completed (Blob ID:{" "}
                          <span className="text-green-300 font-mono">
                            {uploadResult.blobId.slice(0, 16)}...
                          </span>
                          )
                        </div>
                        <div className="text-gray-400">
                          ✓ AI analysis completed (Position:{" "}
                          <span className="text-green-300">
                            {analyzingResult.position}
                          </span>
                          )
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {error && (
                    <div className="mt-4 p-4 rounded-lg bg-red-900/30 border border-red-500/50 backdrop-blur-sm">
                      <p className="text-sm text-red-300">
                        ⚠️ {getFriendlyErrorMessage(error)}
                      </p>
                    </div>
                  )}
                </div>

                {/* PDF Analysis Error Display */}
                {analyzingError && (
                  <div className="p-4 rounded-lg bg-red-900/30 border border-red-500/50 backdrop-blur-sm">
                    <p className="text-sm text-red-300">
                      ⚠️ {getFriendlyErrorMessage(analyzingError)}
                    </p>
                  </div>
                )}

                {/* Submit Error Display */}
                {hasSubmitError && submitError && (
                  <div className="p-4 rounded-lg bg-red-900/30 border border-red-500/50 backdrop-blur-sm">
                    <p className="text-sm text-red-300">
                      ⚠️ {getFriendlyErrorMessage(submitError.message)}
                    </p>
                  </div>
                )}

                {/* Submit Success Modal */}
                {submitSuccess && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="mx-4 max-w-md w-full p-8 rounded-2xl bg-gradient-to-br from-green-900/90 to-emerald-900/90 border border-green-500/50 shadow-2xl animate-in fade-in zoom-in duration-300">
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="p-4 rounded-full bg-green-500/20">
                          <CheckCircle2 className="w-12 h-12 text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">
                          Registration Complete!
                          Registration Complete!
                        </h3>
                        <p className="text-green-300">
                          Your application has been successfully registered.
                        </p>
                        <p className="text-sm text-green-400/80">
                          Redirecting to main page...
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Handle Section Card */}
          <div className="overflow-hidden rounded-2xl border border-white/20 bg-black/30 backdrop-blur-xl shadow-2xl">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">2. Your Handle</h3>
                  <p className="text-sm text-gray-400">Create your unique identifier</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={handle ? `@${handle}` : ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const withoutAt = value.replace(/^@+/, "");
                      setHandle(withoutAt);
                    }}
                    className="w-full px-4 py-4 bg-black/30 border border-gray-600/50 hover:border-purple-500/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl text-white placeholder-gray-400 transition-all duration-300 text-lg"
                    placeholder="@Enter your handle"
                  />
                </div>

                {/* Handle Status Messages */}
                {handleCheckStatus === "checking" && (
                  <div className="flex items-center gap-2 text-sm text-purple-300">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Checking availability...</span>
                  </div>
                )}
                {handleCheckStatus === "available" && (
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Handle is available!</span>
                  </div>
                )}
                {handleCheckStatus === "duplicate" && (
                  <div className="flex items-center gap-2 text-sm text-red-400">
                    <span>⚠️ Handle is already taken</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Summary Section Card */}
          <div className="overflow-hidden rounded-2xl border border-white/20 bg-black/30 backdrop-blur-xl shadow-2xl">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">3. AI Summary</h3>
                  <p className="text-sm text-gray-400">Your extracted profile information</p>
                </div>
              </div>

              {/* AI Summary Content */}
              {!analyzingResult ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400 text-lg mb-2">Waiting for AI Analysis</p>
                  <p className="text-sm text-gray-500">Upload a PDF to see your extracted profile information</p>
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

          {/* Enhanced Submit Section */}
          <div className="text-center space-y-6">
            <div className="max-w-md mx-auto">
              <Button
                onClick={handleSupplyClick}
                disabled={
                  isSubmitting ||
                  state !== "done" ||
                  !uploadResult ||
                  !analyzingResult ||
                  !handle.trim() ||
                  handleCheckStatus !== "available" ||
                  !currentAccount?.address
                }
                className={`
                  w-full px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300 transform
                  ${isSubmitting ||
                    state !== "done" ||
                    !uploadResult ||
                    !analyzingResult ||
                    !handle.trim() ||
                    handleCheckStatus !== "available" ||
                    !currentAccount?.address
                      ? "bg-gray-700/50 cursor-not-allowed opacity-50 scale-95"
                      : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 scale-100 hover:scale-105"
                  } text-white
                `}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    <span>Complete Registration</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
