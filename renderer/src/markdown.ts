import webpack from "renderer/webpack";

interface MarkdownNode extends VX.Dict {
  type: string
};
interface MarkdownState extends VX.Dict {
  allowLinks?: boolean,
  inline: any,
  prevCapture: RegExpExecArray | null
};

interface MarkdownRule {
  // This is all assumpation, as far i know of discord doesn't use the html function
  html?(node: MarkdownNode, parse: (text: MarkdownNode | MarkdownNode[], state: MarkdownState) => string, state: MarkdownState): string,
  match?(text: string, state: MarkdownState): RegExpExecArray | null | void,
  order?: number,
  parse?(capture: RegExpExecArray, parse: (text: string, state: MarkdownState) => MarkdownNode[], state: MarkdownState): MarkdownNode | MarkdownNode[],
  react?(node: MarkdownNode, parse: (node: MarkdownNode | MarkdownNode[], state: string) => React.ReactElement[], state: MarkdownState): React.ReactNode,
  requiredFirstCharacters?: string[]
};

const simpleMarkdownRef: VX.NullableRef<VX.modules.SimpleMarkdown> = { current: null };
const originalRulesRef: VX.NullableRef<VX.Dict<MarkdownRule>> = { current: null };

const queue = new Map<string, MarkdownRule>();

webpack.getLazy<VX.modules.SimpleMarkdown>((m) => m.parse && m.defaultRules).then((simpleMarkdown) => {
  simpleMarkdownRef.current = simpleMarkdown;
  originalRulesRef.current = simpleMarkdown.defaultRules;

  if (queue.size) {
    for (const [ key, rule ] of queue) {
      simpleMarkdown.defaultRules[key] = rule;
    };

    queue.clear();

    simpleMarkdown.parse = simpleMarkdown.reactParserFor(simpleMarkdown.defaultRules);
    simpleMarkdown.parseToAST = simpleMarkdown.astParserFor(simpleMarkdown.defaultRules);
  };
});

export function register(id: string, rule: MarkdownRule): () => void {
  if (simpleMarkdownRef.current) {
    const simpleMarkdown = simpleMarkdownRef.current;

    simpleMarkdown.defaultRules[id] = rule;

    simpleMarkdown.parse = simpleMarkdown.reactParserFor(simpleMarkdown.defaultRules);
    simpleMarkdown.parseToAST = simpleMarkdown.astParserFor(simpleMarkdown.defaultRules);
  }
  else queue.set(id, rule);

  return () => unregister(id);
};

export function unregister(id: string): void {
  if (!simpleMarkdownRef.current) return void queue.delete(id);
  
  const simpleMarkdown = simpleMarkdownRef.current;
  
  delete simpleMarkdown.defaultRules[id];
  if (id in originalRulesRef.current!) simpleMarkdown.defaultRules[id] = originalRulesRef.current![id];

  simpleMarkdown.parse = simpleMarkdown.reactParserFor(simpleMarkdown.defaultRules);
  simpleMarkdown.parseToAST = simpleMarkdown.astParserFor(simpleMarkdown.defaultRules);
};

const defaultState = { allowLinks: true };

export function parse(text: string, state: object = { }) {
  if (!simpleMarkdownRef.current) return null;

  state = Object.assign({}, defaultState, state);

  return simpleMarkdownRef.current.parse(text, {}, state);
};