// Item content rules, run by tools/validate.mjs for every registered item (C.items). An item's description, when it
// has one, is a plain English string the Satchel shows as written ($name and the like filled in); anything else (null, a
// number, an object such as { en }, an empty or blank string) is an error naming the item (QA-211: the Hall's key
// ledger carried an { en } object, and selecting it stopped the Satchel). Keepsakes keep their own { en } descriptions
// and renderer (src/ui/58_keepsakes.js); this rule is for C.items only.
export function itemDescProblem(it) {
  if (!it || !Object.prototype.hasOwnProperty.call(it, 'desc') || it.desc === undefined) return null;
  const d = it.desc;
  if (typeof d !== 'string') return 'desc must be a plain string, not ' + (d === null ? 'null' : Array.isArray(d) ? 'an array' : typeof d);
  if (!d.trim()) return 'desc must not be empty';
  return null;
}
