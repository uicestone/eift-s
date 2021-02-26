export const appendResizeHtmlImage = (html: string, width?: number): string =>
  html &&
  html.replace(
    /<img src=["'](.*?)["']>/g,
    (match, p1) => match && match.replace(p1, p1 + appendStringMaxWidth(width))
  );

export const removeResizeHtmlImage = (html: string): string =>
  html &&
  html.replace(
    /<img src=["'](.*?)["']>/g,
    (match, p1) => match && match.replace(p1, p1.replace(/\?.*?$/, ""))
  );

export const appendResizeImageUrl = (url: string, width = 750): string =>
  url && url + appendStringMaxWidth(width);

export const removeResizeImageUrl = (url: string): string =>
  url && url.replace(/\?.*?$/, "");

function appendStringMaxWidth(width = 1500) {
  if (process.env.ALIYUN_OSS_CROP) {
    return "?x-oss-process=image/resize,w_" + width;
  }
  return "";
}
