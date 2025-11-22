import { FuzzyText } from "@/clients/components/not-found/atoms";
import { Button } from "@/clients/shared/ui";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#2f2f2f] gap-y-24">
      <FuzzyText fontWeight={900}>Page Not Found</FuzzyText>
      <Button
        asChild={true}
        size="lg"
        variant="secondary"
        className="font-bold w-64 h-12 flex items-center gap-4">
        <Link href="/">
          Go to Main Page
          <ArrowRight />
        </Link>
      </Button>
    </div>
  );
};
export default NotFound;
