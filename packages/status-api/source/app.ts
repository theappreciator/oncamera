import express, {Express, Request, Response} from "express";
import PersistService from "./services/persistService";
import { WebcamStatus } from '@oncamera/common';
import { PERSIST_STORE_STATUS_KEY, PERSIST_STORE_TRANSITIONING_KEY, TRANSITIONING_TIME_MILLIS } from "./constants";
import * as log4js from "log4js";
const logger = log4js.getLogger();



const persist = PersistService.Instance;

const app: Express = express();
const port = 9124;

const saveStatus = (status: WebcamStatus) => {
    persist.save(PERSIST_STORE_STATUS_KEY, status);
    logger.info(`Saved new status: ${persist.retrieve(PERSIST_STORE_STATUS_KEY)}`);

    // TODO troublehsoot the following
    // 1) why this isn't always recieved on the listener
    // 2) why this is sometimes received several seconds later on the listener
    // publisher.broadcastEvent([DataKeys.webcamStatus + "=" + newStatus]);
}

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World");
})

app.get("/api/webcam/status", (req: Request, res: Response) => {
    const status = persist.retrieve(PERSIST_STORE_STATUS_KEY) || WebcamStatus.offline;
    res.send({status});
})

app.post("/api/webcam/status", (req: Request, res: Response) => {
    const newStatus = req.body.status;

    if (newStatus && (newStatus === WebcamStatus.online || newStatus === WebcamStatus.offline)) {
        const oldStatus = persist.retrieve(PERSIST_STORE_STATUS_KEY);
        const transitioningTimeout = persist.retrieve(PERSIST_STORE_TRANSITIONING_KEY);
        logger.info(`Status - old: ${oldStatus} new: ${newStatus} transitioning: ${transitioningTimeout !== undefined}`);

        if (oldStatus !== newStatus) {
            if (newStatus === WebcamStatus.offline) {
                if (transitioningTimeout) {
                    logger.info(`Clearing previous transition: ${transitioningTimeout}`);
                    clearTimeout(transitioningTimeout);
                }

                logger.info(`Transitioning status to ${newStatus} in ${TRANSITIONING_TIME_MILLIS}ms`);
                const timeout = setTimeout(() => {
                    saveStatus(newStatus);
                }, TRANSITIONING_TIME_MILLIS);

                persist.save(PERSIST_STORE_TRANSITIONING_KEY, timeout[Symbol.toPrimitive]().toString());
            }
            else {
                saveStatus(newStatus);
            }
        }
    }
    
    const status = persist.retrieve(PERSIST_STORE_STATUS_KEY) || WebcamStatus.offline;
    res.send({status});
})

const appServer = app.listen(port, () => {
    logger.info("Server running on port " + port);
})


module.exports = appServer;