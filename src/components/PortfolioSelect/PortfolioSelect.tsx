import { ComboBox } from "../ComboBox/ComboBox";

interface PortfolioOption {
  id: number;
  urlPrefix: string;
  label: string;
}

interface PortfolioSelectProps {
  portfolioOptions: PortfolioOption[];
  portfolioId: number | undefined;
  onChange: (option: PortfolioOption) => void;
  label?: string;
}

export const PortfolioSelect = ({
  portfolioOptions,
  portfolioId,
  onChange,
  label,
}: PortfolioSelectProps) => {
  const currentPortfolio = portfolioOptions.find(
    (portfolio) => portfolio.id === portfolioId
  );

  return (
    <ComboBox
      value={currentPortfolio}
      onChange={onChange}
      options={portfolioOptions}
      label={label}
    />
  );
};
