import type { ReactNode } from "react";

interface CenterProps {
  children: ReactNode;
}

export const Center = ({ children }: CenterProps) => (
  <div className="flex justify-center items-center h-full">{children}</div>
);
