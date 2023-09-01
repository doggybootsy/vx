import webpack from "renderer/webpack";

interface MarkdownNode extends VX.Dict {
  type: string
};
interface MarkdownState extends VX.Dict {
  inline: any,
  prevCapture: RegExpExecArray | null
};

interface MarkdownRule {
  html?(node: MarkdownNode, parse: (text: string | MarkdownNode | MarkdownNode[], state: MarkdownState) => MarkdownNode, state: MarkdownState): string,
  match?(text: string, state: MarkdownState): RegExpExecArray | null | void,
  order?: number,
  parse?(capture: RegExpExecArray, parse: (text: string | MarkdownNode | MarkdownNode[], state: MarkdownState) => MarkdownNode, state: MarkdownState): MarkdownNode | MarkdownNode[],
  react?(node: MarkdownNode, parse: (text: string | MarkdownNode | MarkdownNode[], state: MarkdownState) => MarkdownNode, state: MarkdownState): React.ReactNode,
  requiredFirstCharacters?: string[]
};

const simpleMarkdownRef: VX.Ref<VX.modules.SimpleMarkdown | null> = { current: null };

const queue = new Map<string, MarkdownRule>();

webpack.getLazy<VX.modules.SimpleMarkdown>((m) => m.parse && m.defaultRules).then((simpleMarkdown) => {
  simpleMarkdownRef.current = simpleMarkdown;

  if (queue.size) {
    for (const [ key, rule ] of queue) {
      simpleMarkdown.defaultRules[key] = rule;
    };

    queue.clear();

    simpleMarkdown.parse = simpleMarkdown.reactParserFor(simpleMarkdown.defaultRules);
    simpleMarkdown.parseToAST = simpleMarkdown.astParserFor(simpleMarkdown.defaultRules);
  };
});

export function register(id: string, rule: MarkdownRule = { }): () => void {
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

  simpleMarkdown.parse = simpleMarkdown.reactParserFor(simpleMarkdown.defaultRules);
  simpleMarkdown.parseToAST = simpleMarkdown.astParserFor(simpleMarkdown.defaultRules);
};

export function parse(text: string, state: object) {
  if (!simpleMarkdownRef.current) return null;

  return simpleMarkdownRef.current.parse(text, {}, state);
};