import {
  ComponentProps,
  Fragment,
  forwardRef,
  ForwardRefExoticComponent,
  RefAttributes,
  FC,
  Ref,
} from "react";
import { Tab } from "@headlessui/react";
import classNames from "classnames";
import { PageLayout } from "../../PageLayout/PageLayout";
import {
  PagesCarousel,
  PagesCarouselProps,
} from "../PagesCarousel/PagesCarousel";

type NavTabType = typeof Tab & {
  CarouselPanels: (props: PagesCarouselProps) => JSX.Element;
  NavTab: ForwardRefExoticComponent<
    ComponentProps<FC> & RefAttributes<HTMLElement>
  >;
};

const NavTab = (
  props: ComponentProps<FC>,
  ref: Ref<HTMLElement> | undefined
) => (
  <Tab
    className={({ selected }) =>
      classNames("p-2 whitespace-nowrap text-base ", {
        "border-b border-primary-600 font-semibold text-primary-600": selected,
        "border-b border-transparent text-gray-600 font-normal": !selected,
      })
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
  <nav className="overflow-y-auto lg:overflow-y-visible w-full bg-white border-b border-gray-200 shadow-md scroll-hidden">
    <Tab.List
      className="container flex flex-nowrap items-end px-2 mx-auto scroll-hidden"
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

type NavTabPanelType = typeof Tab.Panel;
const NavTabPanel: NavTabPanelType = (props) => (
  <PageLayout>
    <Fragment {...props} />
  </PageLayout>
);
NavTabPanel.displayName = "NavTabPanel";
NavTab.Panel = NavTabPanel;

export { NavTab };
