export const addProtocolToUrl = (url: string) =>
  url.includes("https://") || url.includes("http://") ? url : "https://" + url;

export const isValidUrl = (url: string) =>
  /([a-z]+):\/\/(([a-z\d]([a-z\d-]*[a-z\d])*\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\/[-a-z\d%_.~+]*)*(\?[^\s]*)?(#[-a-z\d_]*)?/i.test(url);
