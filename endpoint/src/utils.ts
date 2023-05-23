/**
 * @file This file contains utility method to escape RegExps.
 */

/**
 * Utility method to escape given string to be literal match for {@link RegExp}.
 * Taken from [StackOverflow](https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex).
 * @param str The string to escape metacharacters from.
 * @returns String which has all {@link RegExp} metacharacters escaped.
 */
export const escapeRegExp = (str: string) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
