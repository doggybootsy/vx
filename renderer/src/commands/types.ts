export const enum OptionType {
  STRING = 3,
	INTEGER = 4,
	BOOLEAN = 5,
	USER = 6,
	CHANNEL = 7,
	ROLE = 8,
	MENTIONABLE = 9,
	NUMBER = 10,
	ATTACHMENT = 11
};
export type choice = {
  name: string,
  value: string | number
};
export type option = {
  description?: string,
  name: string,
  required?: boolean,
  type: OptionType,
  maxLength?: number,
  minLength?: number,
  maxValue?: number,
  minValue?: number,
  choices?: choice[]
};
export type command = {
  description?: string,
  name: string,
  id: string,
  options?: option[],
  execute: (options: any[], data: { guild: any, channel: any }) => void
};