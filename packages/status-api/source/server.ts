import { BaseMdnsObjectService } from '@oncamera/common';
import { StatusServerMdnsPublisherService } from "./services";



import * as log4js from "log4js";
log4js.configure({
  appenders: { normal: { type: "stdout" } },
  categories: { default: { appenders: ["normal"], level: "info" } },
});
const logger = log4js.getLogger();



const appServer = require("./app");
const publisher = new StatusServerMdnsPublisherService(BaseMdnsObjectService.Instance);
