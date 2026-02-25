import type { ElementType as ReactElementType, ReactNode } from "react";
import { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import type { Representee } from "api/common/useGetContactInfo";
import {
  PortfolioGroups,
  RepresentativeTag,
  useGetContactInfo,
} from "api/common/useGetContactInfo";
import type { Process } from "api/flowable/useGetContactProcesses";
import { useGetContactProcesses } from "api/flowable/useGetContactProcesses";
import { ReactComponent as CalendarIcon } from "assets/calendar-outlined.svg";
import { ReactComponent as CheckIcon } from "assets/check.svg";
import { ReactComponent as DepositIcon } from "assets/deposit.svg";
import { ReactComponent as EuroIcon } from "assets/euro-circle-outlined.svg";
import { ReactComponent as ProcessIcon } from "assets/external-link.svg";
import { ReactComponent as LogoutIcon } from "assets/logout.svg";
import { ReactComponent as UserIcon } from "assets/user-circle.svg";
import { ReactComponent as MenuIcon } from "assets/view-list.svg";
import { ReactComponent as WithdrawalIcon } from "assets/withdrawal.svg";
import classNames from "classnames";
import Wizard from "components/Wizard/Wizard";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useNavigation } from "hooks/useNavigation";
import i18n from "i18next";
import type { SelectedContact } from "providers/ContractIdProvider";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import type { To, NavigateOptions } from "react-router-dom";
import { keycloakService } from "services/keycloakService";
import { PermissionMode, useFeature } from "services/permissions/usePermission";
import StepFive from "wizards/monthlyInvestments/StepFive/StepFive";
import StepFour from "wizards/monthlyInvestments/StepFour/StepFour";
import StepOne from "wizards/monthlyInvestments/StepOne/StepOne";
import StepThree from "wizards/monthlyInvestments/StepThree/StepThree";
import StepTwo from "wizards/monthlyInvestments/StepTwo/StepTwo";
import StepZero from "wizards/monthlyInvestments/StepZero/StepZero";
import MsStepOne from "wizards/monthlySavings/StepOne/MsStepOne";
import MsStepThree from "wizards/monthlySavings/StepThree/MsStepThree";
import MsStepTwo from "wizards/monthlySavings/StepTwo/MsStepTwo";
import MsStepZero from "wizards/monthlySavings/StepZero/MsStepZero";
import { useModal } from "../Modal/useModal";
import { DepositModalContent } from "../MoneyModals/DepositModalContent/DepositModalContent";
import { WithdrawModalContent } from "../MoneyModals/WithdrawModalContent/WithdrawModalContent";

interface MenuActions {
  logout: () => void;
  deposit: () => void;
  withdraw: () => void;
  monthlyInvestments: () => void;
  monthlySavings: () => void;
  process: (to: To, options?: NavigateOptions) => void;
  setSelectedContact: (contact: SelectedContact) => void;
}

const getMenuItems = (
  menuActions: MenuActions,
  hasLinkedContact: boolean,
  canDeposit: boolean,
  canWithdraw: boolean,
  canMonthlyInvest: boolean,
  canMonthlySave: boolean,
  processes: Process[],
  representees: Representee[],
  contactData: SelectedContact,
  selectedContactId: string | number | undefined
) => {
  if (!hasLinkedContact) {
    return [
      {
        label: i18n.t("userMenu.logout"),
        action: menuActions.logout,
        Icon: LogoutIcon,
        id: "userMenu-logoutButton",
      },
    ];
  }

  return [
    {
      label: contactData?.userName,
      action: () => {
        menuActions.setSelectedContact(contactData);
      },
      Icon: UserIcon,
      selected: contactData?.id?.toString() === selectedContactId?.toString(),
      id: `userMenu-selectedContact-${selectedContactId}`,
    },
    "separator",
    ...(Array.isArray(representees)
      ? representees.map((representee) => ({
          label: representee?.name,
          action: () => {
            menuActions.setSelectedContact({
              id: representee.id,
              contactId: representee.contactId,
              userName: representee.name,
            });
          },
          Icon: UserIcon,
          id: `userMenu-representeeButton-${representee.id}`,
          selected:
            representee?.id?.toString() === selectedContactId?.toString(),
        }))
      : []),
    "separator",
    ...(canDeposit
      ? [
          {
            label: i18n.t("userMenu.deposit"),
            action: menuActions.deposit,
            Icon: DepositIcon,
            id: "userMenu-depositButton",
          },
        ]
      : []),
    "separator",
    ...(canWithdraw
      ? [
          {
            label: i18n.t("userMenu.withdraw"),
            action: menuActions.withdraw,
            Icon: WithdrawalIcon,
            id: "userMenu-withdrawButton",
          },
        ]
      : []),
    "separator",
    ...(canMonthlyInvest
      ? [
          {
            label: i18n.t("userMenu.monthlyInvestments"),
            action: menuActions.monthlyInvestments,
            Icon: CalendarIcon,
            id: "userMenu-monthlyInvestmentsButton",
          },
        ]
      : []),
    "separator",
    ...(canMonthlySave
      ? [
          {
            label: i18n.t("userMenu.monthlySavings"),
            action: menuActions.monthlySavings,
            Icon: EuroIcon,
            id: "userMenu-monthlySavingButton",
          },
        ]
      : []),
    "separator",
    ...processes.map((process) => ({
      label: process.name,
      action: () =>
        menuActions.process(`/form/${process.key}`, {
          state: { header: process.name },
        }),
      id: `userMenu-processButton-${process.name}`,
      Icon: ProcessIcon,
    })),
    "separator",
    {
      label: i18n.t("userMenu.logout"),
      id: "userMenu-logoutButton",
      action: menuActions.logout,
      Icon: LogoutIcon,
    },
  ];
};

export const UserMenu = () => {
  const { selectedContactId, setSelectedContact } = useGetContractIdData();
  const { t } = useModifiedTranslation();
  const { linkedContact } = useKeycloak();
  const { navigate } = useNavigation();
  const { data: processes = [] } = useGetContactProcesses();

  const { canFeature: canMonthlyInvest } = useFeature(
    PortfolioGroups.MONTHLY_INVESTMENTS,
    RepresentativeTag.MONTHLY_INVESTMENTS,
    PermissionMode.ANY
  );
  const { canFeature: canMonthlySave } = useFeature(
    PortfolioGroups.MONTHLY_SAVINGS,
    RepresentativeTag.MONTHLY_SAVINGS,
    PermissionMode.ANY
  );
  const { canFeature: canDeposit } = useFeature(
    PortfolioGroups.DEPOSIT,
    RepresentativeTag.DEPOSIT,
    PermissionMode.ANY
  );
  const { canFeature: canWithdraw } = useFeature(
    PortfolioGroups.WITHDRAW,
    RepresentativeTag.WITHDRAW,
    PermissionMode.ANY
  );

  const { data: contactData, loading } = useGetContactInfo();
  const {
    Modal,
    onOpen: onDepositModalOpen,
    modalProps: depositModalProps,
    contentProps: depositModalContentProps,
  } = useModal();

  const {
    onOpen: onWithdrawModalOpen,
    modalProps: withdrawModalProps,
    contentProps: withdrawModalContentProps,
  } = useModal();

  const [monthlyInvestmentsWizardOpen, setMonthlyInvestmentsWizardOpen] =
    useState(false);
  const [monthlySavingsWizardOpen, setMonthlySavingsWizardOpen] =
    useState(false);

  const menuActions = {
    logout: () => keycloakService.onAuthLogout(),
    deposit: () => onDepositModalOpen(),
    withdraw: () => onWithdrawModalOpen(),
    monthlyInvestments: () => setMonthlyInvestmentsWizardOpen(true),
    monthlySavings: () => setMonthlySavingsWizardOpen(true),
    process: (to: To, options?: NavigateOptions) => {
      navigate(to, options);
    },
    setSelectedContact: (contact: SelectedContact) => {
      setSelectedContact(contact);
    },
  };

  if (loading) return null;

  return (
    <>
      <Menu as="div" className="grid relative items-center">
        <Menu.Button>
          <div className="w-8 h-8 rounded cursor-pointer">
            <MenuIcon className="h-full text-gray-900 dark:text-gray-100" />
          </div>
        </Menu.Button>
        <Transition
          enter="transition duration-100 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
          as={Fragment}
        >
          <Menu.Items className="absolute top-full right-0 z-10 py-1 whitespace-nowrap bg-white dark:bg-gray-800 rounded-md ring-1 ring-black/5 dark:ring-gray-600 shadow-lg origin-top-right focus:outline-none min-w-[120px]">
            {getMenuItems(
              menuActions,
              !!linkedContact,
              canDeposit,
              canWithdraw,
              canMonthlyInvest,
              canMonthlySave,
              processes,
              contactData?.representees || [],
              {
                id: contactData?.contactId,
                contactId: contactData?._contactId,
                userName: contactData?.name,
              },
              selectedContactId
            ).map((item, index) =>
              typeof item === "string" ? (
                <Separator key={index} />
              ) : (
                <MenuItem key={index} {...item} id={item?.id} />
              )
            )}
          </Menu.Items>
        </Transition>
      </Menu>
      <Modal {...depositModalProps} header={t("moneyModal.depositModalHeader")}>
        <DepositModalContent {...depositModalContentProps} />
      </Modal>
      <Modal
        {...withdrawModalProps}
        header={t("moneyModal.withdrawModalHeader")}
      >
        <WithdrawModalContent {...withdrawModalContentProps} />
      </Modal>
      {monthlyInvestmentsWizardOpen && ( //only mounted when needed
        <Wizard
          title={t("wizards.monthlyInvestments.title")}
          isOpen={monthlyInvestmentsWizardOpen}
          setIsOpen={setMonthlyInvestmentsWizardOpen}
          firstStepIsAnIntro
          steps={[
            {
              label: t("wizards.monthlyInvestments.stepZero.stepTitle"),
              component: <StepZero />,
            },
            {
              label: t("wizards.monthlyInvestments.stepOne.stepTitle"),
              component: <StepOne />,
            },
            {
              label: t("wizards.monthlyInvestments.stepTwo.stepTitle"),
              component: <StepTwo />,
            },
            {
              label: t("wizards.monthlyInvestments.stepThree.stepTitle"),
              component: <StepThree />,
            },
            {
              label: t("wizards.monthlyInvestments.stepFour.stepTitle"),
              component: <StepFour />,
            },
            {
              label: t("wizards.monthlyInvestments.stepFive.stepTitle"),
              component: <StepFive />,
            },
          ]}
        />
      )}
      {monthlySavingsWizardOpen && ( //only mounted when needed
        <Wizard
          title={t("wizards.monthlySavings.title")}
          isOpen={monthlySavingsWizardOpen}
          setIsOpen={setMonthlySavingsWizardOpen}
          firstStepIsAnIntro
          steps={[
            {
              label: t("wizards.monthlySavings.stepZero.stepTitle"),
              component: <MsStepZero />,
            },
            {
              label: t("wizards.monthlySavings.stepOne.stepTitle"),
              component: <MsStepOne />,
            },
            {
              label: t("wizards.monthlySavings.stepTwo.stepTitle"),
              component: <MsStepTwo />,
            },
            {
              label: t("wizards.monthlySavings.stepThree.stepTitle"),
              component: <MsStepThree />,
            },
          ]}
        />
      )}
    </>
  );
};

interface MenuItemProps {
  label: ReactNode;
  action: () => void;
  Icon: ReactElementType;
  selected?: boolean;
  id?: string;
}

const Separator = () => {
  return (
    <Menu.Item>
      <hr />
    </Menu.Item>
  );
};

const MenuItem = ({
  action,
  label,
  Icon,
  selected = false,
  id,
}: MenuItemProps) => {
  return (
    <Menu.Item>
      {({ active }) => (
        <button
          data-testid={id}
          className={classNames(
            `p-2 pr-4 flex gap-2 items-center w-full text-base font-medium text-gray-900 dark:text-gray-100 cursor-pointer`,
            {
              "bg-primary-50 dark:bg-gray-700": active,
            }
          )}
          onClick={action}
        >
          <Icon className="w-6 h-6" aria-hidden />
          <div className="items-center pr-2 w-full text-left grow">
            <span>{label}</span>
          </div>
          <span>{selected && <CheckIcon />}</span>
        </button>
      )}
    </Menu.Item>
  );
};
