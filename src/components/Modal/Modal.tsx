import type { MutableRefObject, ReactNode } from "react";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ReactComponent as CloseIcon } from "assets/close.svg";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  modalInitialFocusRef: MutableRefObject<null>;
  header?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  children,
  modalInitialFocusRef,
  header,
}: ModalProps) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} initialFocus={modalInitialFocusRef}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 z-30 bg-black/25" aria-hidden="true" />
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
          <div className="flex overflow-auto fixed inset-0 z-30 justify-center items-baseline p-4">
            <div className="flex justify-center items-center min-h-full">
              <Dialog.Panel className="grid overflow-auto w-full bg-white rounded-lg border shadow-lg">
                {!!header && (
                  <div className="flex justify-between items-center p-4 md:px-6 text-2xl font-bold bg-gray-200">
                    <div>{header}</div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg border-2 border-transparent focus:border-primary-500 cursor-pointer outline-none hover:bg-primary-500/10"
                    >
                      <CloseIcon className="w-8 h-8" />
                    </button>
                  </div>
                )}
                <div className="p-4 md:px-6">{children}</div>
              </Dialog.Panel>
            </div>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};
