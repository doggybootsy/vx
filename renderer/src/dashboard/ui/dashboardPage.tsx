import { cache } from "renderer/util";
import webpack, { filters } from "renderer/webpack";
import Navigation from "renderer/dashboard/ui/navigation";

interface DashboardPageProps {
  toolbar?: React.ReactNode,
  header: React.ReactNode,
  children: React.ReactNode
};

export const HeaderBar = cache(() => {
  // Theres 2 HeaderBars one doesn't have the inbox and Help | so this fixes that
  const strings = filters.byStrings(".GUILD_HOME");
  const props = filters.byKeys("Icon", "Title");
  const filter = filters.every(props, strings);

  return webpack.getModule<React.FunctionComponent<any> & Record<string, React.FunctionComponent<any>>>(filter)!;
});

interface SearchBarProps {
  query: string,
  placeholder: string,
  className: string,
  disabled: boolean,
  autoFocus: boolean,
  size: string,
  onQueryChange(query: string): void,
  onClear(): void,
  onRemoveTag(index: number): void,
  onKeyDown: React.KeyboardEventHandler<HTMLInputElement>,
  tags: string[]
};

interface SearchBar extends React.FunctionComponent<SearchBarProps> {
  Sizes: { SMALL: string }
};

export const SearchBar = cache(() => {
  return webpack.getModule<SearchBar>(m => m.defaultProps && m.defaultProps.size === m.Sizes?.SMALL && "query" in m.defaultProps, { searchExports: true })!;

  webpack.getModule<SearchBar>(m => m.Sizes?.SMALL && m.defaultProps.isLoading === false)!;
});

function StatusIcon() {
  const React = webpack.common.React!;

  return (
    <>
    
    </>
  );
};

function DashboardPage(props: DashboardPageProps) {
  const React = webpack.common.React!;

  return (
    <div 
      className="vx-dashboard" 
      // Theme devs may like
      data-vx-url={location.pathname}
    >
      <HeaderBar.getter
        toolbar={[
          props.toolbar,
          <StatusIcon />
        ]}
        mobileToolbar={[
          props.toolbar,
          <StatusIcon />
        ]}
      >
        {props.header}
      </HeaderBar.getter>
      <div className="vx-dashboard-content">
        <main className="vx-dashboard-main">
          {props.children}
        </main>
        <Navigation.getter />
      </div>
    </div>
  )
};

export default DashboardPage;