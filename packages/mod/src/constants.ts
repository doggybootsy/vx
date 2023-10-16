export interface Developer {
  username: string,
  discord: string,
  github?: string
};

type Developers = Record<string, Developer>;

export const Developers = {
  doggybootsy: {
    username: "doggybootsy",
    discord: "515780151791976453",
    github: "doggybootsy"
  }
} satisfies Developers;
