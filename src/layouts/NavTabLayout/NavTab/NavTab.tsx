import type {
  ComponentProps,
  ForwardRefExoticComponent,
  RefAttributes,
  Ref,
} from "react";
import { forwardRef } from "react";
import { Tab } from "@headlessui/react";
import classNames from "classnames";
import { PageLayout } from "../../PageLayout/PageLayout";
import type { PagesCarouselProps } from "../PagesCarousel/PagesCarousel";
import { PagesCarousel } from "../PagesCarousel/PagesCarousel";

type NavTabType = typeof Tab & {
  CarouselPanels: (
    props: PagesCarouselProps
  ) => ReturnType<typeof PagesCarousel>;
  NavTab: ForwardRefExoticComponent<
    ComponentProps<typeof Tab> & RefAttributes<HTMLElement>
  >;
};

const NavTab = (
  props: ComponentProps<typeof Tab>,
  ref: Ref<HTMLElement> | undefined
) => (
  <Tab
    className={({ selected }: { selected: boolean }) =>
      classNames(
        "px-2 py-2 whitespace-nowrap text-base cursor-pointer outline-none",
        {
          "border-b-2 border-primary-600 font-semibold text-primary-600":
            selected,
          "border-b-2 border-transparent text-gray-600 font-normal": !selected,
        }
      )
    }
    ref={ref}
    {...props}
  />
);

NavTab.displayName = "NavTab";
NavTab.NavTab = forwardRef(NavTab) as NavTabType["NavTab"];
NavTab.NavTab.displayName = "NavTab.NavTab";

NavTab.Group = Tab.Group;

type NavTabListType = typeof Tab.List;
const NavTabList: NavTabListType = (props) => (
  <nav className="overflow-x-auto overflow-y-visible w-full bg-white border-b border-gray-200 shadow-md scroll-hidden">
    <Tab.List
      className="container flex flex-nowrap items-stretch px-2 mx-auto scroll-hidden"
      {...props}
    />
  </nav>
);
NavTabList.displayName = "NavTabList";
NavTab.List = NavTabList;

const NavTabPanels = (props: PagesCarouselProps) => (
  <PagesCarousel {...props}>{props.children}</PagesCarousel>
);
NavTab.CarouselPanels = NavTabPanels;

NavTab.Panels = Tab.Panels;

const NavTabPanel = (props: ComponentProps<typeof Tab.Panel>) => (
  <PageLayout>{props.children as React.ReactNode}</PageLayout>
);
NavTabPanel.displayName = "NavTabPanel";
NavTab.Panel = NavTabPanel as typeof Tab.Panel;

export { NavTab };
