import {container, Lifecycle} from "tsyringe";
import { StatusServerMdnsPublisherService } from './services';
import { BaseMdnsObjectService } from '@oncamera/common';

const register = () => {
    container.register(
        "IMdnsObjectService",
        { useClass: BaseMdnsObjectService },
        { lifecycle: Lifecycle.Singleton }
    ).register(
        "IMdnsPublisherService",
        { useClass: StatusServerMdnsPublisherService }
    );
}

export default register;