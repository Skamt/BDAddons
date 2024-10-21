import { DOM, Patcher, React } from "@Api";
import RenderLinkComponent from "@Modules/RenderLinkComponent";
import { getNestedProp } from "@Utils";
import Logger from "@Utils/Logger";
import CopyButtonComponent from "./components/CopyButtonComponent";
import "./styles";

export default class CopyImageLink {
	start() {
		try {
			// eslint-disable-next-line no-undef
			DOM.addStyle(css);
			if (!RenderLinkComponent) return Logger.patch("RenderLinkComponent");
			Patcher.after(RenderLinkComponent, "type", (_, [{ className, href }], returnValue) => {
				if (!returnValue || !className?.startsWith("downloadLink") || !href) return;
				return [returnValue, <CopyButtonComponent href={href} />];
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
