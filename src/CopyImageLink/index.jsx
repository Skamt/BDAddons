import css from "./styles";
import Logger from "@Utils/Logger";
import { DOM, React, Patcher } from "@Api";
import { getNestedProp } from "@Utils";
import CopyButtonComponent from "./components/CopyButtonComponent";
import ImageModalVideoModal from "@Modules/ImageModalVideoModal";

export default class CopyImageLink {
    start() {
        try {
            DOM.addStyle(css);
            if (ImageModalVideoModal)
                Patcher.after(ImageModalVideoModal, "ImageModal", (_, __, returnValue) => {
                    const children = getNestedProp(returnValue, "props.children");
                    const { href } = getNestedProp(returnValue, "props.children.2.props");
                    children.push(<CopyButtonComponent href={href} />);
                });
            else Logger.patch("ImageModal");
        } catch (e) {
            Logger.error(e);
        }
    }

    stop() {
        DOM.removeStyle();
        Patcher.unpatchAll();
    }
}
