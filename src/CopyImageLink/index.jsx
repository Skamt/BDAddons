import { DOM, Patcher, React } from "@Api";
import ImageModal from "@Patch/ImageModal";
import { getNestedProp } from "@Utils";
import Logger from "@Utils/Logger";
import CopyButtonComponent from "./components/CopyButtonComponent";
import "./styles";

export default class CopyImageLink {
	start() {
		try {
			// eslint-disable-next-line no-undef
			DOM.addStyle(css);
			const { module, key } = ImageModal;
			if (!module || !key) return Logger.patch("ImageModal");
			Patcher.after(module, key, (_, __, returnValue) => {
				const children = getNestedProp(returnValue, "props.children");
				const { src:href } = getNestedProp(returnValue, "props.children.2.props");
				if (!children || !href) return;
				children.push(<CopyButtonComponent href={href} />);
			});
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
	}
}
