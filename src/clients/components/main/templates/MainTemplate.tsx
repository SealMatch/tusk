import { Header } from "@/clients/shared/components/header";
import { HeroSection } from "../organisms";

export const MainTemplate = () => {
  return (
    <div className="flex-1">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>
      <HeroSection />
    </div>
  );
};
