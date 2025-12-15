import type { ReactNode } from "react";
import type { ToastContainerProps } from "react-toastify";
import { Slide, ToastContainer } from "react-toastify";

interface ToastProps extends ToastContainerProps {
  children?: ReactNode;
}

export const Toast = (props: ToastProps) => (
  <ToastContainer
    position="bottom-center"
    hideProgressBar
    theme="colored"
    transition={Slide}
    autoClose={false}
    draggablePercent={60}
    {...props}
  />
);
