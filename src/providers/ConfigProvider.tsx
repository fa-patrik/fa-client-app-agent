import React, { useState, useEffect, useContext } from "react";
import { AnalyticsGroupBy } from "api/types";

interface Config {
  pages:
    | {
        portfolio:
          | {
              overview:
                | {
                    piechart:
                      | {
                          groupBy: AnalyticsGroupBy | undefined;
                          groupCode: string | undefined;
                        }
                      | undefined;
                  }
                | undefined;
            }
          | undefined;
      }
    | undefined;
  banner:
    | {
        title: string | undefined;
        description: string | undefined;
        dismissable: boolean | undefined;
        severity: string | undefined;
      }
    | undefined;
}

export const ConfigContext = React.createContext<Config | null>(null);

export const ConfigProvider: React.FC = ({ children }) => {
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    fetch("/config/config.json")
      .then((response) => response.json())
      .catch((error) => console.error(error))
      .then((json) => setConfig(json));
  }, []);

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const config = useContext(ConfigContext);
  return config;
};
