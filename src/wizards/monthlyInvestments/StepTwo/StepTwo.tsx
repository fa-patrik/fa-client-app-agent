import { useEffect, useState } from "react";
import {
  TradableSecurity,
  useGetTradebleSecurities,
} from "api/trading/useGetTradebleSecurities";
import { SUPPORTED_ROWS_MONTHLY_INVESTMENTS } from "api/trading/useSetMonthlyInvestments";
import { Card, ComboBox, Input, QueryLoadingWrapper } from "components";
import { Option } from "components/ComboBox/ComboBox";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useWizard } from "providers/WizardProvider";
import { toast } from "react-toastify";
import TradableSecurityTable from "wizards/monthlyInvestments/StepTwo/components/TradableSecurityTable";
import { MonthlyInvestmentsWizardState } from "../types";

/**
 * Step two of the monthly investments process.
 * The user selects the securities to invest into.
 */
const StepTwo = () => {
  const { wizardData, setWizardData } =
    useWizard<MonthlyInvestmentsWizardState>();
  const monthlyInvestmentsWizardState = wizardData.data;
  const { t } = useModifiedTranslation();
  //useGetTradebleSecurities has its own api for filtering securities
  //however, that results in extra api requests
  //here we just get the filterOptions and the initially selected filter option
  //and then handle the filtering separately in this component
  const { filters, filterOptions, data, loading, error } =
    useGetTradebleSecurities(
      monthlyInvestmentsWizardState.selectedPortfolioOption?.details?.currency
        ?.securityCode
    );
  const [selectedCountry, setSelectedCountry] = useState<Option>(
    filters.country
  );
  const [selectedType, setSelectedType] = useState<Option | undefined>(
    filters.type
  );
  const [inputNameOrIsin, setInputNameOrIsin] = useState("");

  const [securitiesFilteredByCategory, setSecuritiesFilteredByCategory] =
    useState<TradableSecurity[] | undefined>(undefined);

  const [
    securitiesFilteredByCategoryAndInput,
    setSecuritiesFilteredByCategoryAndInput,
  ] = useState<TradableSecurity[] | undefined>(undefined);

  const [displayedMaxNrSecuritiesWarning, setDisplayedMaxNrSecuritiesWarning] =
    useState(false);

  //filter by selected category
  useEffect(() => {
    if (!selectedCountry && !selectedType) {
      setSecuritiesFilteredByCategory(() => data);
      return;
    }
    const filteredData = data?.filter((security) => {
      if (selectedType?.id && selectedCountry?.id) {
        return (
          security.type?.code === selectedType.id &&
          security.country?.code === selectedCountry.id
        );
      } else if (selectedType?.id) {
        return security.type?.code === selectedType.id;
      } else if (selectedCountry?.id) {
        return security.country?.code === selectedCountry.id;
      } else {
        return true;
      }
    });

    setSecuritiesFilteredByCategory(() => filteredData);
  }, [data, selectedCountry, selectedType]);

  //then filter by written input
  useEffect(() => {
    if (!inputNameOrIsin) {
      //input is empty
      setSecuritiesFilteredByCategoryAndInput(
        () => securitiesFilteredByCategory
      );
      return;
    }

    const filteredByInput = securitiesFilteredByCategory?.filter((security) => {
      return (
        security.name.toLowerCase().includes(inputNameOrIsin.toLowerCase()) ||
        security.isinCode?.toLowerCase().includes(inputNameOrIsin.toLowerCase())
      );
    });
    setSecuritiesFilteredByCategoryAndInput(() => filteredByInput);
  }, [securitiesFilteredByCategory, inputNameOrIsin]);

  const [displayCategoryFilter, setDisplayCategoryFilter] = useState(false);

  const nrOfFiltersApplied =
    selectedCountry.id && selectedType?.id
      ? 2
      : selectedCountry.id
      ? 1
      : selectedType?.id
      ? 1
      : 0;

  //the setter is given to the table in order for it
  //to be able to add or remove, by the user, clicked on securities
  const [selectedSecurities, setSelectedSecurities] = useState<
    TradableSecurity[]
  >(monthlyInvestmentsWizardState.selectedSecurities || []);

  //store relevant data in the wizard context
  //so that later steps of the wizard can get it
  //and enable/disable next and back buttons
  useEffect(() => {
    const disableNext =
      selectedSecurities.length === 0 ||
      selectedSecurities.length > SUPPORTED_ROWS_MONTHLY_INVESTMENTS;
    const disableBack = false;

    if (selectedSecurities.length > 15 && !displayedMaxNrSecuritiesWarning) {
      toast.error("You may only select a maximum of 15 securities.", {
        autoClose: 8000,
        position: "top-center",
        closeButton: false,
      });

      setDisplayedMaxNrSecuritiesWarning(true);
    }

    setWizardData((prevState) => {
      return {
        ...prevState,
        nextDisabled: disableNext,
        backDisabled: disableBack,
        data: {
          ...prevState.data,
          selectedSecurities,
        },
      };
    });
  }, [displayedMaxNrSecuritiesWarning, selectedSecurities, setWizardData]);

  return (
    <div className="flex overflow-y-auto flex-col gap-y-4 p-4 mx-auto w-full max-w-3xl">
      <div>
        <Card>
          <div className="grid md:flex grid-cols-2 gap-1 md:gap-x-2 md:items-end p-2 text-normal">
            <div className="col-span-2 md:w-48">
              <Input
                id="nameIsinInput"
                className=" text-black rounded-lg"
                label={t(
                  "wizards.monthlyInvestments.stepTwo.securityNameIsinInputLabel"
                )}
                value={inputNameOrIsin}
                onChange={(event) =>
                  setInputNameOrIsin(event.currentTarget.value)
                }
              />
            </div>
            {displayCategoryFilter && (
              <>
                <div className="z-50 md:w-48">
                  <ComboBox
                    id="countrySelection"
                    value={selectedCountry}
                    onChange={(country) => setSelectedCountry(country)}
                    options={filterOptions.country}
                    label={t(
                      "wizards.monthlyInvestments.stepTwo.countryFilterInputLabel"
                    )}
                  />
                </div>
                <div className="z-50 md:w-48">
                  <ComboBox
                    id="typeSelection"
                    value={selectedType}
                    onChange={(type) => setSelectedType(type)}
                    options={filterOptions.type}
                    label={t(
                      "wizards.monthlyInvestments.stepTwo.typeFilterInputLabel"
                    )}
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex col-span-2 gap-3 p-3">
            <button
              id="showFiltersButton"
              className="text-sm text-primary-500 underline"
              onClick={() => setDisplayCategoryFilter(!displayCategoryFilter)}
            >
              {!displayCategoryFilter
                ? t(
                    "wizards.monthlyInvestments.stepTwo.displayFilterButtonLabel",
                    {
                      n: nrOfFiltersApplied,
                    }
                  )
                : t("wizards.monthlyInvestments.stepTwo.hideFilterButtonLabel")}
            </button>
            {selectedCountry?.id || selectedType?.id || inputNameOrIsin ? (
              <button
                id="clearFiltersButton"
                className="text-sm text-primary-500 underline"
                onClick={() => {
                  setSelectedCountry(filters.country);
                  setSelectedType(filters.type);
                  setInputNameOrIsin("");
                }}
              >
                {t(
                  "wizards.monthlyInvestments.stepTwo.clearFiltersButtonLabel"
                )}
              </button>
            ) : null}
          </div>
        </Card>
      </div>
      <div className="overflow-y-auto h-full rounded-lg shadow-md min-h-[400px]">
        <QueryLoadingWrapper
          data={securitiesFilteredByCategoryAndInput}
          loading={loading}
          error={error}
          SuccessComponent={TradableSecurityTable}
          successComponentProps={{
            onRowSelect: setSelectedSecurities,
            preSelectedRows: selectedSecurities,
          }}
        />
      </div>
    </div>
  );
};

export default StepTwo;
