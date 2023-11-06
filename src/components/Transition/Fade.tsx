import React from "react";
import { Transition } from "@headlessui/react";

interface FadeProps {
  children: React.ReactNode | null;
}

const Fade: React.FC<FadeProps> = ({ children }) => {
  const show = Boolean(children);

  return (
    <Transition
      appear={true}
      show={show}
      enter="transition-opacity duration-300 ease-out"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-300 ease-in"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      {children !== null ? children : null}
    </Transition>
  );
};

export default Fade;
