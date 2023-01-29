import express, {Express, Request, Response} from "express";
import Persist from "./persist";
import { PERSIST_STORE_KEY, WebcamStatus, MdnsPublisher } from '@oncamera/common';

const app: Express = express();
const port = 9124;

const persist = Persist.Instance;

const webcamServiceName = '_webcam_status._tcp.local';
const publisher = new MdnsPublisher(
    webcamServiceName,
    "Webcam Status Server",
    (json: any) => {
        console.log("STATUS SERVER heartbeat");
    });

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
        console.log("Status - old: " + oldStatus + " new: " + newStatus);

        if (oldStatus !== newStatus) {
            persist.save(PERSIST_STORE_KEY, newStatus);
            console.log("Saved new status: ", persist.retrieve(PERSIST_STORE_KEY));
        }
    }
    
    const status = persist.retrieve(PERSIST_STORE_KEY) || WebcamStatus.offline;
    res.send({status});
})

app.listen(port, () => {
    console.log("Server running on port " + port);
})