import { className } from "../util";
import { getProxy } from "../webpack";
import ErrorBoundary from "./boundary";

interface SearchBarProps {
  query: string,
  className?: string,
  disabled?: boolean,
  autoFocus?: boolean,
  size?: string,
  onChange(value: string): void,
  onClear(): void
};

interface SearchBarSizes {
  LARGE: string,
  MEDIUM: string,
  SMALL: string
};

interface SearchBar extends React.FunctionComponent<SearchBarProps> {
  Sizes: SearchBarSizes
}

const SearchBarModule = getProxy<SearchBar>(m => m.Sizes?.SMALL && m.defaultProps?.isLoading === false);

function SearchBarWrapper(props: SearchBarProps) {
  const cn = className([ props.className, "vx-searchbar" ]);

  return (
    <ErrorBoundary>
      <SearchBarModule {...props} className={cn} />
    </ErrorBoundary>
  );
};
Object.defineProperty(SearchBarWrapper, "Sizes", {
  get() { return SearchBarModule.Sizes; }
});

export const SearchBar = SearchBarWrapper as SearchBar;