import Plugin, { Events } from "@Utils/Plugin";
import { Patcher, React } from "@Api";
import RenderLinkComponent from "@Modules/RenderLinkComponent";
import Logger from "@Utils/Logger";
import CopyButtonComponent from "./components/CopyButtonComponent";
import "./styles";

Plugin.on(Events.START, () => {
	try {
		if (!RenderLinkComponent) return Logger.patchError("RenderLinkComponent");
		Patcher.after(RenderLinkComponent, "type", (_, [{ className, href }], returnValue) => {
			if (!returnValue || !className?.startsWith("downloadLink") || !href) return;
			// biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
			return [returnValue, <CopyButtonComponent href={href} />];
		});
	} catch (e) {
		Logger.error(e);
	}
});

Plugin.on(Events.STOP, () => {
	Patcher.unpatchAll();
});

module.exports = ()=>Plugin;
