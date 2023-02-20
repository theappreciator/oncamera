import express, {Express, Request, Response} from "express";
import Persist from "./services/persistService";
import { BaseMdnsObjectService, DataKeys } from '@oncamera/common';
import { WebcamStatus, MdnsServiceTypes } from '@oncamera/common';
import { StatusServerMdnsPublisherService } from "./services";
import { PERSIST_STORE_KEY } from "./constants";
import * as log4js from "log4js";
const logger = log4js.getLogger();



const persist = Persist.Instance;

const app: Express = express();
const port = 9124;


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

            // TODO troublehsoot the following
            // 1) why this isn't always recieved on the listener
            // 2) why this is sometimes received several seconds later on the listener
            // publisher.broadcastEvent([DataKeys.webcamStatus + "=" + newStatus]);
        }
    }
    
    const status = persist.retrieve(PERSIST_STORE_KEY) || WebcamStatus.offline;
    res.send({status});
})

const appServer = app.listen(port, () => {
    logger.info("Server running on port " + port);
})


module.exports = appServer;