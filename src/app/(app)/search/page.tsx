"use client";

import { useSearchHistory } from "@/clients/shared/hooks/useSearchHistory";
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
    .min(1, "Please enter a search term")
    .max(500, "Please enter within 500 characters"),
});

type SearchFormData = z.infer<typeof searchSchema>;

export default function SearchFormPage() {
  const router = useRouter();
  const addHistory = useSearchStore((state) => state.addHistory);
  const { invalidateHistory } = useSearchHistory();

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

  useEffect(() => {
    setFocus("query");
  }, [setFocus]);

  const onSubmit = (data: SearchFormData) => {
    addHistory(data.query);
    invalidateHistory(); // 이렇게 사용

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
        What kind of talent are you looking for?
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-2xl space-y-4">
        <div className="relative">
          <Textarea
            {...register("query")}
            placeholder="Enter your search term"
            className="min-h-32 pr-12 bg-[#2f2f2f] border-gray-700 text-white placeholder:text-gray-500 resize-none"
            onKeyDown={handleKeyDown}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isSubmitting}
            className="absolute bottom-3 right-3">
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {errors.query && (
          <p className="text-sm text-destructive">{errors.query.message}</p>
        )}

        <p className="text-xs text-gray-500 text-center">
          Press Enter to search, Shift+Enter for new line
        </p>
      </form>

      {/* 추천 검색어 */}
      <div className="mt-8 w-full max-w-2xl">
        <p className="text-sm text-gray-500 mb-3">These are some examples:</p>
        <div className="flex flex-col gap-2">
          {[
            "Node.js and TypeScript experience needed",
            "React Native and TypeScript experience needed",
            "Data analyst Python",
            "DevOps AWS Engineer",
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
              }}>
              {example}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
