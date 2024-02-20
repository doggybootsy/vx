export const boolValues = <const>{
  true: "(min-width: 0px)",
  false: "(max-width: 0px)"
};

export function bool(value: any) {
  return boolValues[Boolean(value).toString() as keyof typeof boolValues];
}
