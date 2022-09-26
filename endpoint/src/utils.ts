// From https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
export const escapeRegExp = (str: string) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
