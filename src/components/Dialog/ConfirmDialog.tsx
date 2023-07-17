import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "components";
import { Variant } from "components/Button/Button";

interface ConfirmDialogProps {
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
      <Dialog
        id="confirmDialog"
        as="div"
        className="overflow-y-auto fixed inset-0 z-40"
        onClose={() => setIsOpen(false)}
      >
        <div className="px-4 min-h-screen text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          </Transition.Child>
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div
              id="confirmDialogContent"
              className="inline-block overflow-hidden p-4 my-8 w-full max-w-md text-left align-middle bg-white rounded-2xl shadow-xl transition-all transform"
            >
              <Dialog.Title
                id="confirmDialogTitle"
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                {title}
              </Dialog.Title>
              <div className="mt-2">
                <p
                  id="confirmDialogDescription"
                  className="text-sm text-gray-500"
                >
                  {description}
                </p>
              </div>

              <div className="flex flex-row justify-between mt-4">
                {cancelButtonText && (
                  <Button
                    disabled={loading}
                    id="confirmDialogCancelButton"
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
                    id="confirmDialogConfirmButton"
                    onClick={handleConfirm}
                  >
                    {confirmButtonText}
                  </Button>
                )}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
