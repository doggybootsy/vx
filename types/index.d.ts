declare module "window:console" {
  import console = require("node:console");
  export = console;
}
