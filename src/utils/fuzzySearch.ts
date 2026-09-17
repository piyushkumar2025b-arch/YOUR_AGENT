import Fuse, { IFuseOptions } from "fuse.js";

export interface SearchableItem {
  id: string;
  title: string;
  category: string;
  description: string;
  tags?: string[];
  action?: () => void;
}

const defaultFuseOptions: IFuseOptions<SearchableItem> = {
  keys: [
    { name: "title", weight: 0.5 },
    { name: "description", weight: 0.3 },
    { name: "category", weight: 0.1 },
    { name: "tags", weight: 0.1 }
  ],
  threshold: 0.35,
  ignoreLocation: true
};

export function createFuzzySearchIndex(items: SearchableItem[], options?: IFuseOptions<SearchableItem>) {
  return new Fuse(items, { ...defaultFuseOptions, ...options });
}

export function performFuzzySearch(items: SearchableItem[], query: string): SearchableItem[] {
  if (!query || query.trim().length === 0) return items;
  const fuse = createFuzzySearchIndex(items);
  return fuse.search(query).map((res) => res.item);
}
