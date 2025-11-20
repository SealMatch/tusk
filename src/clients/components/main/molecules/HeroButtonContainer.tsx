import { SearchIcon, ShieldIcon } from "@/clients/shared/components/icons";
import { CallToActionButton } from "../atoms";

export const HeroButtonContainer = () => {
  return (
    <div className="flex gap-6">
      <CallToActionButton>
        <ShieldIcon />
        Start as a Job Seeker
      </CallToActionButton>
      <CallToActionButton>
        <SearchIcon />
        Search as a Recruiter
      </CallToActionButton>
    </div>
  );
};
