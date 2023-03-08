import { useGetContactInfo } from "api/initial/useGetContactInfo";
import { useGetContractIdData } from "providers/ContractIdProvider";
import theme from "tailwindTheme";
import { Avatar } from "./Avatar";

export const SelectedContactAvatar = () => {
  const { selectedContact } = useGetContractIdData();
  const { data: contactData } = useGetContactInfo();
  if (selectedContact && contactData) {
    const indexOfContact =
      contactData?.representees?.findIndex(
        (representee) => representee.id === selectedContact.id
      ) ?? 0;
    //default contact gets 0, and any rep start from 1
    const colorIndex = indexOfContact !== -1 ? indexOfContact + 1 : 0;
    const avatarColors = theme.colors.avatarColors;
    const selectedContactAvatarColor =
      avatarColors[
        ((colorIndex % avatarColors.length) + avatarColors.length) %
          avatarColors.length
      ];

    return (
      <Avatar
        backgroundColor={selectedContactAvatarColor}
        initials={selectedContact?.initials?.charAt(0) ?? ""}
      />
    );
  } else {
    return <Avatar backgroundColor={"bg-white"} initials={""} />;
  }
};
