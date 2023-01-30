import express, {Express, Request, Response} from "express";
import Persist from "./persist";
import { MdnsPublisher } from '@oncamera/common';
import { WebcamStatus, MdnsServiceTypes } from '@oncamera/common';

const app: Express = express();
const port = 9124;
const PERSIST_STORE_KEY = "webcam.status"; // this probably needs to be moved back to status-api

import * as log4js from "log4js";
log4js.configure({
  appenders: { normal: { type: "stdout" } },
  categories: { default: { appenders: ["normal"], level: "info" } },
});
const logger = log4js.getLogger();

const persist = Persist.Instance;

const publisher = new MdnsPublisher(
    MdnsServiceTypes.webcamStatus,
    "Webcam Status Server"
);

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World");
})

app.get("/api/webcam/status", (req: Request, res: Response) => {
    const status = persist.retrieve(PERSIST_STORE_KEY) || WebcamStatus.offline;
    res.send({status});
})

app.post("/api/webcam/status", (req: Request, res: Response) => {

    const newStatus = req.body.status;

    if (newStatus && (newStatus === WebcamStatus.online || newStatus === WebcamStatus.offline)) {

        const oldStatus = persist.retrieve(PERSIST_STORE_KEY);
        logger.info("Status - old: " + oldStatus + " new: " + newStatus);

        if (oldStatus !== newStatus) {
            persist.save(PERSIST_STORE_KEY, newStatus);
            logger.info("Saved new status: ", persist.retrieve(PERSIST_STORE_KEY));
        }
    }
    
    const status = persist.retrieve(PERSIST_STORE_KEY) || WebcamStatus.offline;
    res.send({status});
})

app.listen(port, () => {
    logger.info("Server running on port " + port);
})