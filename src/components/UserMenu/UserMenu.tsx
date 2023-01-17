import { ElementType as ReactElementType, Fragment, ReactNode } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  Process,
  useGetContactProcesses,
} from "api/flowable/useGetContactProcesses";
import { Representee, useGetContactInfo } from "api/initial/useGetContactInfo";
import { ReactComponent as CheckIcon } from "assets/check.svg";
import { ReactComponent as DepositIcon } from "assets/deposit.svg";
import { ReactComponent as ProcessIcon } from "assets/external-link.svg";
import { ReactComponent as LogoutIcon } from "assets/logout.svg";
import { ReactComponent as UserIcon } from "assets/user-circle.svg";
import { ReactComponent as MenuIcon } from "assets/view-list.svg";
import { ReactComponent as WithdrawalIcon } from "assets/withdrawal.svg";
import classNames from "classnames";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import i18n from "i18next";
import {
  useGetContractIdData,
  SelectedContact,
} from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { useNavigate, To, NavigateOptions } from "react-router";
import { keycloakService } from "services/keycloakService";
import { useCanDeposit, useCanWithdraw } from "services/permissions/money";
import { initials } from "utils/initials";
import { useModal } from "../Modal/useModal";
import { DepositModalContent } from "../MoneyModals/DepositModalContent/DepositModalContent";
import { WithdrawModalContent } from "../MoneyModals/WithdrawModalContent/WithdrawModalContent";
interface MenuActions {
  logout: () => void;
  deposit: () => void;
  withdraw: () => void;
  process: (to: To, options?: NavigateOptions) => void;
  setSelectedContact: (contact: SelectedContact) => void;
}

const getMenuItems = (
  menuActions: MenuActions,
  hasLinkedContact: boolean,
  canDeposit: boolean,
  canWithdraw: boolean,
  processes: Process[],
  representees: Representee[],
  contactData: SelectedContact,
  selectedContactId: string | number
) => {
  if (!hasLinkedContact) {
    return [
      {
        label: i18n.t("userMenu.logout"),
        action: menuActions.logout,
        Icon: LogoutIcon,
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
      selected: contactData?.id === selectedContactId,
    },
    "separator",
    ...(Array.isArray(representees)
      ? representees.map((representee, index) => ({
          label: representee?.name,
          action: () => {
            menuActions.setSelectedContact({
              id: representee.id,
              contactId: representee.contactId,
              userName: representee.name,
              initials: initials(representee.name),
            });
          },
          Icon: UserIcon,
          selected: representee?.id === selectedContactId,
        }))
      : []),
    "separator",
    ...(canDeposit
      ? [
          {
            label: i18n.t("userMenu.deposit"),
            action: menuActions.deposit,
            Icon: DepositIcon,
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
      Icon: ProcessIcon,
    })),
    "separator",
    {
      label: i18n.t("userMenu.logout"),
      action: menuActions.logout,
      Icon: LogoutIcon,
    },
  ];
};

export const UserMenu = () => {
  const { selectedContactId, setSelectedContactId, setSelectedContact } =
    useGetContractIdData();
  const { t } = useModifiedTranslation();
  const { linkedContact } = useKeycloak();
  const navigate = useNavigate();
  const { data: processes = [] } = useGetContactProcesses();
  const canDeposit = useCanDeposit();
  const canWithdraw = useCanWithdraw();
  const { data: contactData } = useGetContactInfo();
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

  const menuActions = {
    logout: () => keycloakService.onAuthLogout(),
    deposit: () => onDepositModalOpen(),
    withdraw: () => onWithdrawModalOpen(),
    process: (to: To, options?: NavigateOptions) => navigate(to, options),
    setSelectedContact: (contact: SelectedContact) => {
      setSelectedContact(contact);
      setSelectedContactId(contact.id);
      navigate("/overview", { replace: true });
    },
  };

  return (
    <>
      <Menu as="div" className="grid relative items-center">
        <Menu.Button>
          <div className="w-8 h-8 rounded cursor-pointer">
            <MenuIcon className="h-full text-gray-900" />
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
          <Menu.Items className="absolute top-full right-0 z-10 py-1 bg-white rounded-md ring-1 ring-black ring-opacity-5 shadow-lg origin-top-right focus:outline-none min-w-[120px]">
            {getMenuItems(
              menuActions,
              !!linkedContact,
              canDeposit,
              canWithdraw,
              processes,
              contactData?.representees || [],
              {
                id: contactData?.contactId || "",
                contactId: contactData?.contactId || "",
                userName: contactData?.name || "-",
                initials: initials(contactData?.name),
              },
              selectedContactId
            ).map((item, index) =>
              typeof item === "string" ? (
                <Separator key={index} />
              ) : (
                <MenuItem key={index} {...item} />
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
    </>
  );
};

interface MenuItemProps {
  label: ReactNode;
  action: () => void;
  Icon: ReactElementType;
  selected?: boolean;
}

const Separator = () => {
  return (
    <Menu.Item>
      <hr />
    </Menu.Item>
  );
};

const MenuItem = ({ action, label, Icon, selected = false }: MenuItemProps) => {
  return (
    <Menu.Item>
      {({ active }) => (
        <button
          className={classNames(
            `p-2 pr-4 flex gap-2 items-center w-full text-base font-medium text-gray-900`,
            {
              "bg-primary-50": active,
            }
          )}
          onClick={action}
        >
          <Icon className="w-6 h-6" aria-hidden />
          <div className="items-center pr-2 w-full text-left grow">
            <span>{label}</span>
          </div>
          <span className="">{selected && <CheckIcon />}</span>
        </button>
      )}
    </Menu.Item>
  );
};
