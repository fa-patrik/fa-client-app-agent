import React from "react";
import { useInView } from "react-intersection-observer";

interface InViewProps {
  children: React.ReactNode;
  triggerOnce?: boolean;
}

const RenderWhenInView: React.FC<InViewProps> = ({
  children,
  triggerOnce = true,
}) => {
  const { ref, inView } = useInView({ triggerOnce });
  return <div ref={ref}>{inView && children}</div>;
};

export default RenderWhenInView;
