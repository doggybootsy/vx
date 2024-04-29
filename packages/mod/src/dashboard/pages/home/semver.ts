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
    if (state >= 1) return -1;
    if (state <= -1) return 1;
  }

  return 0;
}

function comparePrelease(versionA: string, versionB: string) {
  const a = versionA.match(PreReleaseRegex);
  const b = versionB.match(PreReleaseRegex);

  if (a && !b) return -1;
  if (!a && b) return 1;
  if (!a && !b) return 0;
  
  const [,, av ] = a!;
  const [,, bv ] = b!;

  if (av && !bv) return -1;
  if (!av && bv) return 1;
  if (!av && !bv) return 0;

  const state = Number(av) - Number(bv);

  if (state >= 1) return -1;
  if (state <= -1) return 1;
  return 0;
}

export function compare(versionA: string, versionB: string) {
  return compareMain(versionA, versionB) || comparePrelease(versionA, versionB);
}