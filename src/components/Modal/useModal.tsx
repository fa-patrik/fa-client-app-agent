import { useCallback, useRef, useState } from "react";
import { Modal } from "./Modal";

export const useModal = <TInitialData,>() => {
  const modalInitialDataRef = useRef<TInitialData | undefined>(undefined);
  const modalInitialFocusRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = useCallback((initialData?: TInitialData) => {
    if (initialData) {
      modalInitialDataRef.current = initialData;
    }
    setIsOpen(true);
  }, []);
  const onClose = useCallback(() => {
    setIsOpen(false);
    //modalInitialDataRef.current = undefined;
  }, []);

  return {
    Modal,
    onOpen,
    onClose,
    modalProps: {
      isOpen,
      onClose,
      modalInitialFocusRef,
    },
    contentProps: {
      modalInitialFocusRef,
      onClose,
      ...(modalInitialDataRef.current as TInitialData),
    },
  };
};
