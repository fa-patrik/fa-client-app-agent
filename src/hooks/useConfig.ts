import { useState, useEffect } from "react";
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
    | undefined
    | undefined;
}

export const useConfig = () => {
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    fetch("/config/config.json")
      .then((response) => response.json())
      .then((json) => setConfig(json));
  }, []);

  return config;
};
