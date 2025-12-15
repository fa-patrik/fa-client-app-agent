import type { ReactNode } from "react";
import { ReactComponent as TimesCircle } from "assets/times-circle.svg";
import { Card } from "../Card/Card";

interface EmptyComponentProps {
  header: string;
  children?: ReactNode;
}

export const ErrorMessage = ({ header, children }: EmptyComponentProps) => (
  <Card>
    <div className="grid gap-4 justify-center justify-items-center items-center text-base font-normal text-gray-500 py-[10%]">
      <TimesCircle className="w-16 h-16 " />
      <div className="text-xl md:text-2xl font-medium text-center whitespace-pre-line">
        {header}
      </div>
      <div className="px-2 text-sm md:text-base text-center whitespace-pre-line">
        {children}
      </div>
    </div>
  </Card>
);
