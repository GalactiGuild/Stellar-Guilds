import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/useMobile/useIsMobile";
import BottomNavigation from "./BottomNavigation";

interface Props {
  children: ReactNode;
}

const MobileLayout = ({ children }: Props) => {
  const isMobile = useIsMobile();

  return (
    <div className="mobile-layout">
      {children}
      {isMobile && <BottomNavigation />}
    </div>
  );
};

export default MobileLayout;