export interface Notification {
  id: string,
  icon?(props: { width: number, height: number }): React.ReactNode,
  type?: "warn" | "warning" | "error" | "danger" | "success" | "positive" | "info",
  title: React.ReactNode | Array<React.ReactNode>,
  description?: React.ReactNode | Array<React.ReactNode>,
  footer?: React.ReactNode
};
