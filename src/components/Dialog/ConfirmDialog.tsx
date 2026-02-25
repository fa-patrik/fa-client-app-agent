import React, { Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
} from "@headlessui/react";
import { Button } from "components";
import type { Variant } from "components/Button/Button";

interface ConfirmDialogProps {
  id?: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onConfirm?: () => void;
  title: string;
  description: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  loading?: boolean;
  disabled?: boolean;
  confirmButtonVariant?: Variant;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  id,
  isOpen,
  setIsOpen,
  onConfirm,
  title,
  description,
  confirmButtonText,
  cancelButtonText,
  loading,
  disabled,
  confirmButtonVariant,
}) => {
  const handleConfirm = async () => {
    if (onConfirm) await onConfirm();
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={() => setIsOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 z-40 bg-black/30" aria-hidden="true" />
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
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <DialogPanel
              id={!id ? "confirmDialogContent" : `${id}-content`}
              className="w-full max-w-md p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
            >
              <DialogTitle
                id={!id ? "confirmDialogTitle" : `${id}-title`}
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
              >
                {title}
              </DialogTitle>
              <div className="mt-2">
                <p
                  id={!id ? "confirmDialogDescription" : `${id}-description`}
                  className="text-sm text-gray-500 dark:text-gray-400"
                >
                  {description}
                </p>
              </div>

              <div className="flex flex-row justify-between mt-4">
                {cancelButtonText && (
                  <Button
                    disabled={loading}
                    id={
                      !id ? "confirmDialogCancelButton" : `${id}-cancelButton`
                    }
                    variant="Secondary"
                    onClick={() => setIsOpen(false)}
                  >
                    {cancelButtonText}
                  </Button>
                )}
                {confirmButtonText && handleConfirm && (
                  <Button
                    variant={confirmButtonVariant || "Primary"}
                    disabled={loading || disabled}
                    isLoading={loading}
                    id={
                      !id ? "confirmDialogConfirmButton" : `${id}-confirmButton`
                    }
                    onClick={handleConfirm}
                  >
                    {confirmButtonText}
                  </Button>
                )}
              </div>
            </DialogPanel>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};
