import { useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ReactComponent as CloseIcon } from "assets/close.svg";
import { Button } from "components";
import { ConfirmDialog } from "components/Dialog/ConfirmDialog";
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
          <div className="fixed inset-0 z-30 bg-white">
            <Dialog.Panel className="w-full h-full">
              <Dialog.Title className="flex justify-between items-center py-1 px-4 mb-2 font-bold bg-gray-200 shadow-md text-md">
                <div className="flex flex-col">
                  <div>{title}</div>
                  <div className="text-sm font-normal">
                    {steps[wizardData.step].label}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmDialogOpen(true)}
                  className="rounded-lg border-2 border-transparent focus:border-primary-500 cursor-pointer outline-none hover:bg-primary-500/10"
                >
                  <CloseIcon className="w-8 h-8" />
                </button>
              </Dialog.Title>
              <div className="overflow-y-auto p-1 md:px-6 pb-36 h-full">
                {steps[wizardData.step].component}
              </div>
              {!hideStepper && (
                <div className="flex sticky bottom-0 justify-between items-center p-2 text-lg font-bold bg-white shadow-md">
                  <Button
                    variant="Secondary"
                    disabled={wizardData.step === 0 || wizardData.backDisabled}
                    onClick={prevStep}
                    className="rounded-lg border-2 border-transparent focus:border-primary-500 cursor-pointer outline-none hover:bg-primary-500/10"
                  >
                    Back
                  </Button>
                  <div className="font-normal">
                    {wizardData.step + (firstStepIsAnIntro ? 0 : 1)}/
                    {steps.length - (firstStepIsAnIntro ? 1 : 0)}
                  </div>

                  {wizardData.step === steps.length - 1 ? (
                    <Button
                      variant="Success"
                      onClick={handleFinish}
                      className="rounded-lg border-2 border-transparent focus:border-primary-500 cursor-pointer outline-none hover:bg-primary-500/10"
                    >
                      Finish
                    </Button>
                  ) : (
                    <Button
                      variant="Primary"
                      disabled={
                        wizardData.step === steps.length - 1 ||
                        wizardData.nextDisabled
                      }
                      onClick={nextStep}
                      className="rounded-lg border-2 border-transparent focus:border-primary-500 cursor-pointer outline-none hover:bg-primary-500/10"
                    >
                      Next
                    </Button>
                  )}
                </div>
              )}
            </Dialog.Panel>
            <ConfirmDialog
              title="Are you sure that you want to exit?"
              description={hideStepper ? "" : "You will lose your progress."}
              confirmButtonText="Exit"
              cancelButtonText="Cancel"
              isOpen={confirmDialogOpen}
              onConfirm={exitWizard}
              setIsOpen={setConfirmDialogOpen}
            />
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

export default Wizard;
