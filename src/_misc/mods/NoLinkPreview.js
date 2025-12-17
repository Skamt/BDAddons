import Logger from "@Utils/Logger";
import { Markdown } from "@Discord/Modules";
import { Filters, getModule } from "@Webpack";
import { Patcher } from "@Api";
import { nop, Disposable } from "@Utils";

// const Parser = getModule(Filters.byKeys("parseEmbedTitle", "defaultRules"));
const subText = getModule(a => a?.requiredFirstCharacters?.[0] === "-");

export default class NoLinkPreview extends Disposable {
	Init() {
		if (!Markdown?.defaultRules?.link) return Logger.patchError("NoLinkPreview");
		this.patches = [
			Patcher.instead(Markdown.defaultRules.link, "match", nop), 
			Patcher.instead(Markdown.defaultRules.subtext, "match", nop), 
			Patcher.instead(subText, "match", nop)
		];
	}
}
