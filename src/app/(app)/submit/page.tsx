"use client";

import { useState, useRef } from "react";
import { Button } from "@/clients/shared/ui";
import { Upload } from "lucide-react";

export default function SubmitPage() {
  const [handle, setHandle] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      alert("PDF 파일만 업로드 가능합니다.");
      event.target.value = "";
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSupplyClick = () => {
    // 제출 기능은 나중에 구현
    console.log("Supply button clicked");
    console.log({ handle, introduction, selectedFile });
  };

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
              <h2 className="mb-6 text-2xl font-semibold text-white">Apply Form</h2>
              
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
                    {selectedFile && (
                      <span className="text-sm text-gray-300">
                        {selectedFile.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. 본인 핸들 */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    2. 본인 핸들
                  </label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="핸들을 입력하세요"
                  />
                </div>

                {/* 3. 자기소개 - 직접 입력 */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    3. 자기소개
                  </label>
                  <textarea
                    value={introduction}
                    onChange={(e) => setIntroduction(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-vertical"
                    placeholder="자기소개를 입력하세요"
                  />
                </div>

                {/* Supply 버튼 */}
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSupplyClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
                  >
                    Supply
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