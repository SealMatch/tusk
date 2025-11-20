/**
 * 기술 스킬 색상 정보
 */
export interface SkillColorInfo {
  bg: string; // 배경색 (Tailwind class)
  text: string; // 텍스트색 (Tailwind class)
}

/**
 * 기술 스킬별 색상 매핑
 * - 각 스킬마다 고유한 색상을 가짐
 * - 등록되지 않은 스킬은 'other' 색상 사용
 */
export const SKILL_COLORS: Record<string, SkillColorInfo> = {
  // JavaScript/TypeScript 생태계 - 파란색 계열
  React: { bg: "bg-sky-500/20", text: "text-sky-300" },
  "React Native": { bg: "bg-sky-600/20", text: "text-sky-300" },
  "Next.js": { bg: "bg-slate-500/20", text: "text-slate-300" },
  Vue: { bg: "bg-emerald-500/20", text: "text-emerald-300" },
  "Vue.js": { bg: "bg-emerald-500/20", text: "text-emerald-300" },
  Angular: { bg: "bg-red-500/20", text: "text-red-300" },
  Svelte: { bg: "bg-orange-500/20", text: "text-orange-300" },
  "Node.js": { bg: "bg-green-500/20", text: "text-green-300" },
  Express: { bg: "bg-gray-500/20", text: "text-gray-300" },
  NestJS: { bg: "bg-rose-500/20", text: "text-rose-300" },
  JavaScript: { bg: "bg-yellow-500/20", text: "text-yellow-300" },
  TypeScript: { bg: "bg-blue-500/20", text: "text-blue-300" },

  // Python 생태계 - 노란색/주황색 계열
  Python: { bg: "bg-yellow-600/20", text: "text-yellow-300" },
  Django: { bg: "bg-green-600/20", text: "text-green-300" },
  FastAPI: { bg: "bg-teal-500/20", text: "text-teal-300" },
  Flask: { bg: "bg-gray-600/20", text: "text-gray-300" },

  // Java 생태계 - 빨간색/주황색 계열
  Java: { bg: "bg-red-600/20", text: "text-red-300" },
  Spring: { bg: "bg-lime-500/20", text: "text-lime-300" },
  "Spring Boot": { bg: "bg-lime-500/20", text: "text-lime-300" },
  Kotlin: { bg: "bg-purple-500/20", text: "text-purple-300" },

  // 모바일 - 보라색 계열
  Flutter: { bg: "bg-cyan-500/20", text: "text-cyan-300" },
  Swift: { bg: "bg-orange-600/20", text: "text-orange-300" },
  SwiftUI: { bg: "bg-orange-500/20", text: "text-orange-300" },

  // DevOps/Cloud - 주황색/청록색 계열
  Docker: { bg: "bg-blue-600/20", text: "text-blue-300" },
  Kubernetes: { bg: "bg-blue-700/20", text: "text-blue-300" },
  AWS: { bg: "bg-amber-500/20", text: "text-amber-300" },
  GCP: { bg: "bg-red-500/20", text: "text-red-300" },
  Azure: { bg: "bg-sky-600/20", text: "text-sky-300" },
  Terraform: { bg: "bg-violet-500/20", text: "text-violet-300" },

  // AI/ML - 핑크색/보라색 계열
  TensorFlow: { bg: "bg-orange-500/20", text: "text-orange-300" },
  PyTorch: { bg: "bg-rose-600/20", text: "text-rose-300" },
  Pandas: { bg: "bg-indigo-500/20", text: "text-indigo-300" },
  NumPy: { bg: "bg-blue-500/20", text: "text-blue-300" },

  // 블록체인/Web3 - 청록색 계열
  Solidity: { bg: "bg-gray-700/20", text: "text-gray-300" },
  Rust: { bg: "bg-orange-700/20", text: "text-orange-300" },
  Move: { bg: "bg-cyan-600/20", text: "text-cyan-300" },
  Ethereum: { bg: "bg-indigo-600/20", text: "text-indigo-300" },
  Sui: { bg: "bg-sky-500/20", text: "text-sky-300" },

  // 데이터베이스 - 파란색/빨간색 계열
  MySQL: { bg: "bg-blue-500/20", text: "text-blue-300" },
  PostgreSQL: { bg: "bg-sky-600/20", text: "text-sky-300" },
  MongoDB: { bg: "bg-green-600/20", text: "text-green-300" },
  Redis: { bg: "bg-red-500/20", text: "text-red-300" },
  GraphQL: { bg: "bg-pink-500/20", text: "text-pink-300" },

  // 기타 언어
  Go: { bg: "bg-cyan-500/20", text: "text-cyan-300" },
  "C++": { bg: "bg-blue-700/20", text: "text-blue-300" },
  "C#": { bg: "bg-purple-600/20", text: "text-purple-300" },
  Ruby: { bg: "bg-red-600/20", text: "text-red-300" },
  PHP: { bg: "bg-indigo-500/20", text: "text-indigo-300" },
  Scala: { bg: "bg-red-500/20", text: "text-red-300" },
};

/**
 * 기본 색상 (등록되지 않은 스킬용)
 */
export const DEFAULT_SKILL_COLOR: SkillColorInfo = {
  bg: "bg-gray-600/20",
  text: "text-gray-300",
};

/**
 * 기술 스킬 이름으로 색상 정보 가져오기
 * @param skill - 기술 스킬 이름
 * @returns 색상 정보 (등록되지 않은 스킬은 기본 색상)
 */
export const getSkillColor = (skill: string): SkillColorInfo => {
  return SKILL_COLORS[skill] || DEFAULT_SKILL_COLOR;
};
