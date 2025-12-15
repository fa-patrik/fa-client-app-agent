import { useEffect, useState } from "react";

let externalContactHTML = "";

export const useGetContactHTML = () => {
  const [contactHTML, setContactHTML] = useState(externalContactHTML);

  useEffect(() => {
    let unmounted = false;
    const fetchContactHTML = async () => {
      const response = await fetch(`${import.meta.env.BASE_URL}contact.html`);
      externalContactHTML = await response.text();

      setContactHTML(externalContactHTML);
    };

    if (contactHTML === "" && !unmounted) {
      fetchContactHTML();
    }
    return () => {
      unmounted = true;
    };
  }, [contactHTML]);

  return contactHTML;
};
