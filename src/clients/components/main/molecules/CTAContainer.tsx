import { SearchIcon, ShieldIcon } from "@/clients/shared/components/icons";
import { CallToActionButton } from "../atoms";

export const CTAContainer = () => {
  return (
    <div className="flex gap-6">
      <CallToActionButton href="/submit">
        <ShieldIcon />
        Start as a Job Seeker
      </CallToActionButton>
      <CallToActionButton href="/search">
        <SearchIcon />
        Search as a Recruiter
      </CallToActionButton>
    </div>
  );
};
