import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

export const Logo = () => {
  const { portfolioId, contactDbId } = useParams();
  const navigate = useNavigate();
  const storedFormat = localStorage.logoFormat;
  const [imgFormat, setImgFormat] = useState(storedFormat || "svg");

  useEffect(() => {
    const formats = ["svg", "png", "jpg", "jpeg", "gif"];

    // check if the image exists
    const checkImage = (path: string) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ path, status: "ok" });
        img.onerror = () => resolve({ path, status: "error" });
        img.src = path;
      }) as Promise<{ path: string; status: "ok" | "error" }>;

    // find the first successful image format and set it
    const testFormats = async (format = "") => {
      const formatCheckPromises = !format
        ? formats.map((format) =>
            checkImage(`${process.env.PUBLIC_URL}/logo.${format}`).then(
              (result) => ({ ...result, format })
            )
          )
        : [
            checkImage(`${process.env.PUBLIC_URL}/logo.${format}`).then(
              (result) => ({ ...result, format })
            ),
          ];

      const images = await Promise.allSettled(
        formatCheckPromises.filter(Boolean)
      );
      const successfulImage = images.find(
        (image) => image.status === "fulfilled" && image.value.status === "ok"
      ) as {
        value: { path: string; status: "ok" | "error"; format: string };
      };
      const successfulFormat = successfulImage?.value.format;
      if (successfulImage) {
        setImgFormat(successfulFormat);
        localStorage.logoFormat = successfulFormat;
      } else if (format.length)
        // if the specified image format is not available, try fetching all specified formats
        testFormats();
    };
    storedFormat ? testFormats(storedFormat) : testFormats();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <img src={`${process.env.PUBLIC_URL}/logo.${imgFormat}`} alt="logo" />
    </div>
  );
};
