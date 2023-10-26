import { useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ReactComponent as CloseIcon } from "assets/close.svg";
import { Button } from "components";
import { ConfirmDialog } from "components/Dialog/ConfirmDialog";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useWizard } from "providers/WizardProvider";

interface WizardStep {
  label: string;
  component: React.ReactElement;
}

interface WizardProps {
  title: string;
  steps: WizardStep[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  /**
   * Hides stepper on first step.
   * And reduces the step displayed by 1.
   */
  firstStepIsAnIntro?: boolean;
}

export const Wizard: React.FC<WizardProps> = ({
  title,
  steps,
  isOpen,
  setIsOpen,
  firstStepIsAnIntro = false,
}) => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { wizardData, setWizardData } = useWizard();
  const { t } = useModifiedTranslation();

  const nextStep = () => {
    if (wizardData.step < steps.length - 1)
      setWizardData((prevState) => ({
        ...prevState,
        step: prevState.step + 1,
      }));
  };

  const prevStep = () => {
    if (wizardData.step > 0)
      setWizardData((prevState) => ({
        ...prevState,
        step: prevState.step - 1,
      }));
  };

  const resetWizardState = () => {
    setWizardData(() => ({
      step: 0,
      data: {},
      backDisabled: false,
      nextDisabled: true,
      onFinish: undefined,
      onExit: exitWizard,
      onReset: resetWizardState,
    }));
  };

  const exitWizard = () => {
    //remove the wizard's state from context
    resetWizardState();
    setConfirmDialogOpen(false);
    setIsOpen(false);
  };

  //catch the onClose event by the Dialog
  //and open the confirmation dialog before
  //exiting
  const onClose = () => {
    setConfirmDialogOpen(true);
  };

  const handleFinish = () => {
    wizardData.onFinish?.();
  };

  //attach the exit and reset function
  //such that they can be used by the steps
  useEffect(() => {
    setWizardData((prevState) => ({
      ...prevState,
      onExit: exitWizard,
      onReset: resetWizardState,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hideStepper = wizardData.step === 0 && firstStepIsAnIntro;
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 z-20 bg-black/25" aria-hidden="true" />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="flex fixed inset-0 z-40 w-full h-full">
            <div
              id="wizardContainer"
              className="m-auto w-full md:w-screen lg:w-4/5 xl:w-3/4 max-w-6xl h-full md:h-screen bg-white rounded-lg xl:h-[95%] lg:h-[95%]"
            >
              <Dialog.Panel className="relative w-full h-full">
                <Dialog.Title className="flex absolute top-0 justify-between items-center py-1 px-4 w-full h-14 font-bold bg-gray-100 lg:rounded-t-lg border-b shadow-sm text-md">
                  <div className="flex flex-col">
                    <div id="wizardTitle">{title}</div>
                    <div className="text-sm font-normal" id="wizardStepTitle">
                      {steps[wizardData.step].label}
                    </div>
                  </div>
                  <button
                    id="wizardCloseButton"
                    type="button"
                    onClick={() => setConfirmDialogOpen(true)}
                    className="rounded-lg border-2 border-transparent focus:border-primary-500 cursor-pointer outline-none hover:bg-primary-500/10"
                  >
                    <CloseIcon className="w-8 h-8" />
                  </button>
                </Dialog.Title>
                <div
                  className="flex overflow-y-auto py-14 w-full h-full"
                  id="wizardStepComponentContainer"
                >
                  {steps[wizardData.step].component}
                </div>

                {!hideStepper && (
                  <div className="flex absolute bottom-0 justify-between items-center p-2 w-full h-14 text-lg font-bold bg-white lg:rounded-b-lg border-t shadow-2xl">
                    <Button
                      id="wizardBackButton"
                      variant="Secondary"
                      disabled={
                        wizardData.step === 0 || wizardData.backDisabled
                      }
                      onClick={prevStep}
                      className="rounded-lg border-2 border-transparent focus:border-primary-500 cursor-pointer outline-none hover:bg-primary-500/10"
                    >
                      {t("component.wizard.backButtonLabel")}
                    </Button>
                    <div className="font-normal" id="wizardStepCount">
                      {wizardData.step + (firstStepIsAnIntro ? 0 : 1)}/
                      {steps.length - (firstStepIsAnIntro ? 1 : 0)}
                    </div>

                    {wizardData.step === steps.length - 1 ? (
                      <Button
                        id="wizardFinishButton"
                        variant="Primary"
                        onClick={handleFinish}
                        className="rounded-lg border-2 border-transparent focus:border-primary-500 cursor-pointer outline-none hover:bg-primary-500/10"
                      >
                        {t("component.wizard.finishButtonLabel")}
                      </Button>
                    ) : (
                      <Button
                        id="wizardNextButton"
                        variant="Primary"
                        disabled={
                          wizardData.step === steps.length - 1 ||
                          wizardData.nextDisabled
                        }
                        onClick={nextStep}
                        className="rounded-lg border-2 border-transparent focus:border-primary-500 cursor-pointer outline-none hover:bg-primary-500/10"
                      >
                        {t("component.wizard.nextButtonLabel")}
                      </Button>
                    )}
                  </div>
                )}
              </Dialog.Panel>
              <ConfirmDialog
                id="wizard-exitDialog"
                title={t("component.wizard.exitDialogTitle")}
                description={
                  hideStepper ? "" : t("component.wizard.exitDialogDescription")
                }
                confirmButtonText={t(
                  "component.wizard.exitDialogConfirmButtonLable"
                )}
                cancelButtonText={t(
                  "component.wizard.exitDialogCancelButtonLabel"
                )}
                isOpen={confirmDialogOpen}
                onConfirm={exitWizard}
                setIsOpen={setConfirmDialogOpen}
              />
            </div>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

export default Wizard;
