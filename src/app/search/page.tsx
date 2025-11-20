"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/clients/shared/ui/button";
import { Input } from "@/clients/shared/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/clients/shared/ui/form";

const searchSchema = z.object({
  skills: z.string().min(1, "기술 스택을 입력해주세요"),
  position: z.string().min(1, "직무를 입력해주세요"),
  experience: z.string().optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;

export default function SearchFormPage() {
  const router = useRouter();
  
  // 1. 폼 생성
  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      skills: "",
      position: "",
      experience: "",
    },
  });

  // 2. 제출 핸들러
  const onSubmit = (data: SearchFormData) => {
    const params = new URLSearchParams(data as any);
    router.push(`/search/results?${params.toString()}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <h1 className="text-3xl font-bold mb-8 text-white tracking-tight">
        어떤 인재를 찾으시나요?
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md space-y-6">
          
          {/* 필드 1: 기술 스택 */}
          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">기술 스택</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="예: React, Node.js" 
                    className="bg-[#2f2f2f] border-gray-700 text-white" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            {/* 필드 2: 직무 */}
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">직무</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Front-end" 
                      className="bg-[#2f2f2f] border-gray-700 text-white"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 필드 3: 경력 */}
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">경력</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="3년차 이상" 
                      className="bg-[#2f2f2f] border-gray-700 text-white"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full h-12 text-lg font-semibold">
            검색 시작하기
          </Button>
        </form>
      </Form>
    </div>
  );
}