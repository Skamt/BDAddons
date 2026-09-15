import Plugin from "@common/Plugin";
import { Patcher, React } from "@Api";
import RenderLinkComponent from "@Modules/RenderLinkComponent";
import Logger from "@Utils/Logger";
import CopyButtonComponent from "./components/CopyButtonComponent";
import "./styles";

Plugin.onStart(() => {
	try {
		if (!RenderLinkComponent) return Logger.patchError("RenderLinkComponent");
		Patcher.after(RenderLinkComponent, "type", (_, [{ className, href }], returnValue) => {
			if (!returnValue || !className?.includes("downloadLink") || !href) return;
			// biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
			return [returnValue, <CopyButtonComponent href={href} />];
		});
	} catch (e) {
		Logger.error(e);
	}
});

Plugin.onStop(() => {
	Patcher.unpatchAll();
});

module.exports = ()=>Plugin;
