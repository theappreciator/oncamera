import express, {Express, Request, Response} from "express";
import Persist from "./persist";

const app: Express = express();
const port = 9124;

const persist = Persist.Instance;

const KEYS = {
    webcamStatus: "webcam.status",
    online: "webcam.status.online",
    offline: "webcam.status.offline"
}

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World");
})

app.get("/api/webcam/status", (req: Request, res: Response) => {
    const status = persist.retrieve(KEYS.webcamStatus) || KEYS.offline;
    res.send({status});
})

app.post("/api/webcam/status", (req: Request, res: Response) => {

    const newStatus = req.body.status;

    if (newStatus && (newStatus === KEYS.online || newStatus === KEYS.offline)) {

        const oldStatus = persist.retrieve(KEYS.webcamStatus);
        console.log("Status - old: " + oldStatus + " new: " + newStatus);

        if (oldStatus !== newStatus) {
            persist.save(KEYS.webcamStatus, newStatus);
            console.log("Saved new status: ", persist.retrieve(KEYS.webcamStatus));
        }
    }
    
    const status = persist.retrieve(KEYS.webcamStatus) || KEYS.offline;
    res.send({status});
})

app.listen(port, () => {
    console.log("Server running on port " + port);
})