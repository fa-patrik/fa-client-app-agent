import { useNavigate } from "react-router";
import { useParams } from "react-router-dom";

export const Logo = () => {
  const { portfolioId, contactDbId } = useParams();
  const navigate = useNavigate();
  const logoFilename = process.env.REACT_APP_LOGO_FILENAME || "logo.svg";
  
  return (
    <div
      className="w-10 h-10 rounded cursor-pointer"
      onClick={() => {
        let path = portfolioId
          ? `/portfolio/${portfolioId}/overview`
          : "/overview";
        if (contactDbId) path = `/impersonate/${contactDbId}${path}`;
        navigate(path);
      }}
    >
      <img src={`${process.env.PUBLIC_URL}/${logoFilename}`} alt="logo" />
    </div>
  );
};
