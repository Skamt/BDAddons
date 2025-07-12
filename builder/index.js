require("dotenv").config();
const { program } = require("commander");

require("./global");
require("./build");
require("./list");

program.version(`v${pkg.version}`).description("BD Plugin builder");

program.parse();
