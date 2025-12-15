import React, { useLayoutEffect, useState } from "react";

interface CountryFlagProps extends React.SVGProps<SVGSVGElement> {
  code: string | undefined;
}

export const CountryFlag = ({ code, ...props }: CountryFlagProps) => {
  const [FlagComponent, setFlagComponent] =
    useState<React.FC<React.SVGProps<SVGSVGElement>>>();
  useLayoutEffect(() => {
    let unmounted = false;
    if (code) {
      const importFlag = async (): Promise<void> => {
        try {
          const flagModule = await import(`../../assets/flags/${code.toLowerCase()}.svg`);
          if (!unmounted) {
            setFlagComponent(() => flagModule.ReactComponent);
          }
        } catch (error) {
          console.warn(`Flag for country code "${code}" not found`);
          if (!unmounted) {
            setFlagComponent(undefined);
          }
        }
      };
      importFlag();
    } else {
      setFlagComponent(undefined);
    }
    return () => {
      unmounted = true;
    };
  }, [code]);

  return FlagComponent ? <FlagComponent {...props} /> : null;
};
