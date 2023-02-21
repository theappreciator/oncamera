import {container, Lifecycle} from "tsyringe";
import { WebcamStatusServerMdnsListenerService, WebcamStatusServerApiListenerService, WebcamStatusServerMdnsApiListenerService } from './services';
import { BaseMdnsObjectService } from '@oncamera/common';

console.log("STARTING REGISTER");
const register = () => {
    console.log("DOING REGISTER");
    container.register(
        "IMdnsObjectService",
        { useClass: BaseMdnsObjectService },
        { lifecycle: Lifecycle.Singleton }
    ).register(
        "IMdnsListenerService",
        { useClass: WebcamStatusServerMdnsListenerService }
    ).register(
        "IApiListenerService",
        { useClass: WebcamStatusServerApiListenerService }
    ).register(
        "IMdnsApiListenerService",
        { useClass: WebcamStatusServerMdnsApiListenerService }
    )
}

export default register;