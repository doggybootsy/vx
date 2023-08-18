import cp from "node:child_process";

export async function compile() {
  console.log("Building in Production mode (webpack)");
  
  const shouldPipe = process.argv.includes("--wp-pipe");
  async function compile(section) {
    console.log(`Compiling ${section}`);
    const wpProcess = cp.exec(`npx webpack-cli --config ${section}/webpack.config.js`, {
      cwd: process.cwd()
    });
    if (shouldPipe) wpProcess.stdout.pipe(process.stdout);
  
    let resolve;
    wpProcess.on("close", (code) => resolve(code));
    const code = await new Promise(r => resolve = r);
    console.log(`Compiled ${section}`);
    return code;
  };
  
  await compile("main");
  await compile("preload");
  await compile("renderer");
};