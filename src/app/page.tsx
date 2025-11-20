import { MainTemplate } from "@/clients/components/main/templates";

export default function Home() {
  return (
    <main className="w-full flex flex-col flex-1 overflow-y-auto snap-y snap-mandatory">
      <MainTemplate />
    </main>
  );
}
