// eslint-disable-next-line no-unused-vars
import config from "@config";
import css from "./styles";
import Logger from "@Utils/Logger";
// eslint-disable-next-line no-unused-vars
import { DOM, React, Patcher } from "@Api";
import { getNestedProp } from "@Utils";
import CopyButtonComponent from "./components/CopyButtonComponent";
import ImageModal from "@Patch/ImageModal";

export default class CopyImageLink {
    start() {
        try {
            DOM.addStyle(css);
            const { module, key } = ImageModal;
            if (module && key)
                Patcher.after(module, key, (_, __, returnValue) => {
                    const children = getNestedProp(returnValue, "props.children");
                    const { href } = getNestedProp(returnValue, "props.children.2.props");
                    children.push(<CopyButtonComponent href={href} />);
                });
            else Logger.patch("patchImageModal");
        } catch (e) {
            Logger.error(e);
        }
    }

    stop() {
        DOM.removeStyle();
        Patcher.unpatchAll();
    }
}
