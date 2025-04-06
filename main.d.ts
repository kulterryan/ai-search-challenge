interface SearchResult {
  title: string;
  link: string;
  description: string;
  grades?: string[];
  image?: string;
  content_type?: string;
  source: string;
  embedding?: any;
}

type SearchResultType = {
  id: number;
  title: string;
  description: string;
  image: string;
  type: string;
};