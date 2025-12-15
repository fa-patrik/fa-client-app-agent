import type { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="container py-4 overflow-y-auto px-2 mx-auto">
      {children}
    </div>
  );
};
