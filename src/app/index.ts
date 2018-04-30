import * as api from "./api";
import { config } from "./config";
import { logger } from "./logger";
import * as mail from "./mail";

export default {
  api,                    
  config,
  logger,
  mail,

  // TODO: typescriptify the `db` and `error` modules and then export them as
  // they have been above.
  db: require("./db"),
  error: require("./error"),
};
