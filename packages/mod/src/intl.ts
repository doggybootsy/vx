import { getLocale } from "vx:i18n";

const map = new WeakMap<any, () => any>();

function getFormatter<T>(formatter: any): T {
  return map.get(formatter)!();
}

export class ListFormat {
  constructor(options?: Intl.ListFormatOptions) {
    const formatters: Record<string, Intl.ListFormat> = {};

    map.set(this, () => {
      const local = getLocale();
  
      if (local in formatters) return formatters[local];
  
      const formatter = new Intl.ListFormat(getLocale(), options);
      formatters[local] = formatter;
      return formatter;
    });
  }
  
  format(list: string[]): string {
    return getFormatter<Intl.ListFormat>(this).format(list);
  }
  formatToParts(list: string[]): Intl.ListFormatPart[] {
    return getFormatter<Intl.ListFormat>(this).formatToParts(list);
  }
}

export class DateTimeFormat {
  constructor(options?: Intl.DateTimeFormatOptions) {
    const formatters: Record<string, Intl.DateTimeFormat> = {};

    map.set(this, () => {
      const local = getLocale();
  
      if (local in formatters) return formatters[local];
  
      const formatter = new Intl.DateTimeFormat(getLocale(), options);
      formatters[local] = formatter;
      return formatter;
    });
  }
  
  format(date?: number | Date | undefined): string {
    return getFormatter<Intl.DateTimeFormat>(this).format(date);
  }
  formatToParts(date?: number | Date | undefined): Intl.DateTimeFormatPart[] {
    return getFormatter<Intl.DateTimeFormat>(this).formatToParts(date);
  }
}

export class NumberFormat {
  constructor(options?: Intl.NumberFormatOptions) {
    const formatters: Record<string, Intl.NumberFormat> = {};

    map.set(this, () => {
      const local = getLocale();
  
      if (local in formatters) return formatters[local];
  
      const formatter = new Intl.NumberFormat(getLocale(), options);
      formatters[local] = formatter;
      return formatter;
    });
  }
  
  format(value: number | bigint): string {
    return getFormatter<Intl.NumberFormat>(this).format(value);
  }
  formatToParts(number?: number | bigint | undefined): Intl.NumberFormatPart[] {
    return getFormatter<Intl.NumberFormat>(this).formatToParts(number);
  }
}
