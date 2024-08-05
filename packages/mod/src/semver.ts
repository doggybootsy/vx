export enum SemverCompareState {
  EQUAL = 0,
  LESS = -1,
  GREATER = 1,

  UP_TO_DATE = 0,
  OUT_OF_DATE = -1,
  IN_THE_FUTURE = 1
}

const MainReleaseRegex = /^(\d+)\.(\d+)\.(\d+)/;
const PreReleaseRegex = /-(\D+)(?:\.(\d+))?$/;

function compareMain(versionA: string, versionB: string) {
  const a = versionA.match(MainReleaseRegex)!;
  const b = versionB.match(MainReleaseRegex)!;

  const states = Array(3).fill(null);

  for (const i in states) {
    if (Object.prototype.hasOwnProperty.call(a, i)) {
      const index = Number(i) + 1;

      const an = Number(a[index]);
      const nn = Number(b[index]);
      
      states[i] = an - nn;
    }
  }
  
  for (const state of states) {
    if (state >= 1) return SemverCompareState.LESS;
    if (state <= -1) return SemverCompareState.GREATER;
  }

  return SemverCompareState.EQUAL;
}

function comparePrelease(versionA: string, versionB: string) {
  const a = versionA.match(PreReleaseRegex);
  const b = versionB.match(PreReleaseRegex);

  if (a && !b) return SemverCompareState.LESS;
  if (!a && b) return SemverCompareState.GREATER;
  if (!a && !b) return SemverCompareState.EQUAL;
  
  const [,, av ] = a!;
  const [,, bv ] = b!;

  if (av && !bv) return SemverCompareState.LESS;
  if (!av && bv) return SemverCompareState.GREATER;
  if (!av && !bv) return SemverCompareState.EQUAL;

  const state = Number(av) - Number(bv);

  if (state >= 1) return SemverCompareState.LESS;
  if (state <= -1) return SemverCompareState.GREATER;
  return SemverCompareState.EQUAL;
}

export function compare(versionA: string, versionB: string) {
  return compareMain(versionA, versionB) || comparePrelease(versionA, versionB);
}