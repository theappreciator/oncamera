import "reflect-metadata";
import { container } from "tsyringe";
import { StatusServerMdnsPublisherService } from "./services";
import iocRegister from "./ioc.config";

import * as log4js from "log4js";
log4js.configure({
  appenders: { normal: { type: "stdout" } },
  categories: { default: { appenders: ["normal"], level: "info" } },
});
const logger = log4js.getLogger();



iocRegister();
const appServer = require("./app");
const publisher = container.resolve(StatusServerMdnsPublisherService);