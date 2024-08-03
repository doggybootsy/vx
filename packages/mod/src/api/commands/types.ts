import { Channel, Guild } from "discord-types/general";

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
}

export interface Choice {
  name: string,
  value: string | number
}

export interface Option {
  description?: string,
  name: string,
  required?: boolean,
  type: OptionType,
  maxLength?: number,
  minLength?: number,
  maxValue?: number,
  minValue?: number,
  choices?: Choice[]
}

export interface Command {
  name: string,
  description?: string,
  id: string,
  options?: Option[],
  execute(options: any[], { channel, guild }: { channel: Channel, guild?: Guild }): void,
  predicate?(): boolean
}