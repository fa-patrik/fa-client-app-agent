/**
 * Add protocol to url if it doesn't have one
 * - if url starts with http:// or https://, return url
 * - else, add https:// to url
 * @param url url to add protocol to
 * @returns url with protocol
 */
export const addProtocolToUrl = (url: string) =>
  url.match(/^[a-z]+:\/\//i) ? url : "https://" + url;

export const isValidUrl = (url: string) =>
  /([a-z]+):\/\/(([a-z\d]([a-z\d-]*[a-z\d])*\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\/[-a-z\d%_.~+]*)*(\?[^\s]*)?(#[-a-z\d_]*)?/i.test(
    url
  );
