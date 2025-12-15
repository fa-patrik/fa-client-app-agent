import React from "react";
import { Transition } from "@headlessui/react";

interface FadeProps {
  children: React.ReactNode | null;
}

const Fade: React.FC<FadeProps> = ({ children }) => {
  const show = Boolean(children);

  if (!show) {
    return null;
  }

  return (
    <Transition
      appear={true}
      show={show}
      as="div"
      enter="transition-opacity duration-300 ease-out"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-300 ease-in"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div>{children}</div>
    </Transition>
  );
};

export default Fade;
