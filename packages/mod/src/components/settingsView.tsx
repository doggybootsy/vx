import { getModuleIdBySource, webpackRequire, getByKeys, getByProtoKeys } from "../webpack";

import { makeLazy, proxyCache } from "../util";
import ErrorBoundary from "./boundary";

const moduleIdRegex = /\(0,.{1,3}\.makeLazy\)\({createPromise:\(\)=>.{1,3}\..{1,3}\("(\d+?)"\).then\(.{1,3}.bind\(.{1,3},"\1"\)\),webpackId:"\1",name:"UserSettings"}\)/;

type Predicate = () => boolean;

interface DividerSection {
  section: "DIVIDER",
  predicate: Predicate
};
interface CustomSection {
  section: "CUSTOM",
  predicate: Predicate,
  element: React.ComponentType
};
interface HeaderSection {
  section: "HEADER",
  predicate: Predicate,
  label: string
};
interface ViewSection {
  section: string,
  element: React.ComponentType,
  predicate: Predicate,
  label: string,
  icon: React.ReactNode
};

type Section = DividerSection | CustomSection | HeaderSection | ViewSection;

interface SettingsViewProps {
  sections: Section[],
  section: string,
  onClose(): void,
  onSetSection(section: string): void
};

const sections = {
  Divider(options: Predicate | { predicate?: Predicate } = {}): DividerSection {
    let predicate: Predicate;
    
    if (typeof options === "function") {
      predicate = options;
    }
    else {
      predicate = options.predicate ?? (() => true);
    }

    return {
      section: "DIVIDER",
      predicate
    }
  },
  Custom(options: React.ComponentType | { predicate?: Predicate, element: React.ComponentType }): CustomSection {
    let predicate: Predicate;
    let element: React.ComponentType;
    
    if (typeof options === "object") {
      element = options.element;
      predicate = options.predicate ?? (() => true);
    }
    else {
      element = options;
      predicate = () => true;
    }

    return {
      section: "CUSTOM", 
      element,
      predicate
    }
  },
  Header(options: string | { predicate?: Predicate, label: string, icon?: React.ReactElement }): CustomSection {
    let predicate: Predicate;
    let label: string;
    let icon: React.ReactElement | null;

    if (typeof options === "string") {
      label = options;
      predicate = () => true;
      icon = null;
    }
    else {
      label = options.label;
      predicate = options.predicate ?? (() => true);
      icon = options.icon ?? null;
    }

    return SettingsView.Sections.Custom({
      element: () => (
        <div className="vx-sidebar-header">
          <div className="vx-sidebar-text">{label}</div>
          {icon && (
            <div className="vx-sidebar-icon">
              {icon}
            </div>
          )}
        </div>
      )
    });

    // return {
    //   section: "HEADER", 
    //   label,
    //   predicate
    // }
  },
  View(options: { predicate?: Predicate, element: React.ComponentType, section?: string, label: string, icon?: React.ReactNode }): ViewSection {
    const { predicate = () => true, element, label, section = label.toLowerCase().replace(" ", "-"), icon = null } = options;

    return {
      section,
      element,
      predicate,
      label,
      icon
    }
  }
};

function getSettingsView() {
  const moduleId = getModuleIdBySource("CollectiblesShop", "GuildSettings", "UserSettings")!;

  const module = String(webpackRequire!.m[moduleId]!);

  const [, matchedId ] = module.match(moduleIdRegex)!;

  return makeLazy({
    name: "SettingsView",
    factory: async () => {
      await webpackRequire!.el(matchedId).then(webpackRequire!.bind(webpackRequire, matchedId));

      return getByProtoKeys<React.ComponentType<SettingsViewProps>>([ "renderSidebar", "getPredicateSections" ])!;
    }
  });
};

const WrappedSettingsView = proxyCache(getSettingsView);

export function SettingsView(props: SettingsViewProps) {
  return (
    <ErrorBoundary>
      <WrappedSettingsView {...props} />
    </ErrorBoundary>
  )
};

SettingsView.Sections = sections;