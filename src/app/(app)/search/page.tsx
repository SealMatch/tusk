"use client";

import { useSearchStore } from "@/clients/shared/stores";
import { Button, Textarea } from "@/clients/shared/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const searchSchema = z.object({
  query: z
    .string()
    .min(1, "검색어를 입력해주세요")
    .max(500, "500자 이내로 입력해주세요"),
});

type SearchFormData = z.infer<typeof searchSchema>;

export default function SearchFormPage() {
  const router = useRouter();
  const addHistory = useSearchStore((state) => state.addHistory);

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: "",
    },
  });

  // 페이지 로드 시 자동 포커스
  useEffect(() => {
    setFocus("query");
  }, [setFocus]);

  const onSubmit = (data: SearchFormData) => {
    // 히스토리에 추가
    addHistory(data.query);

    // 결과 페이지로 이동
    const params = new URLSearchParams({ query: data.query });
    router.push(`/search/results?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <h1 className="text-3xl font-bold mb-10 text-white tracking-tight">
        어떤 인재를 찾으시나요?
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-2xl space-y-4"
      >
        <div className="relative">
          <Textarea
            {...register("query")}
            placeholder="원하는 조건을 단어 또는 문장으로 입력해주세요"
            className="min-h-32 pr-12 bg-[#2f2f2f] border-gray-700 text-white placeholder:text-gray-500 resize-none"
            onKeyDown={handleKeyDown}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isSubmitting}
            className="absolute bottom-3 right-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {errors.query && (
          <p className="text-sm text-destructive">{errors.query.message}</p>
        )}

        <p className="text-xs text-gray-500 text-center">
          Enter로 검색, Shift+Enter로 줄바꿈
        </p>
      </form>

      {/* 추천 검색어 */}
      <div className="mt-8 w-full max-w-2xl">
        <p className="text-sm text-gray-500 mb-3">이런 검색어는 어떠세요?</p>
        <div className="flex flex-col gap-2">
          {[
            "Node.js와 TypeScript 경험이 있는 백엔드 개발자가 필요해요",
            "React Native와 TypeScript 경험이 있는 모바일 개발자가 필요해요",
            "데이터 분석가 Python",
            "DevOps 엔지니어 AWS",
          ].map((example) => (
            <Button
              key={example}
              variant="outline"
              size="sm"
              type="button"
              className="
                w-full 
                justify-start text-left
                h-auto py-3 px-4
                whitespace-normal
                text-white bg-transparent
                border-none 
                hover:bg-[#2f2f2f] hover:text-white
                transition-colors
              "
              onClick={() => {
                addHistory(example);
                const params = new URLSearchParams({ query: example });
                router.push(`/search/results?${params.toString()}`);
              }}
            >
              {example}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
