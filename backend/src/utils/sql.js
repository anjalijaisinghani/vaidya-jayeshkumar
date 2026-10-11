// Escapes LIKE wildcards so a search for "%" or "_" is treated as plain text.
export function escapeLike(term) {
  return term.replace(/[\\%_]/g, '\\$&');
}