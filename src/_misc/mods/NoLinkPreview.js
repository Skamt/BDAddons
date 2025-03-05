import Logger from "@Utils/Logger";
import { Filters, getModule } from "@Webpack";
import { Patcher } from "@Api";
import { nop, Disposable } from "@Utils";

const Parser = getModule(Filters.byKeys("parseEmbedTitle", "defaultRules"));
const subText = getModule(a => a?.requiredFirstCharacters?.[0] === "-");
export default class NoLinkPreview extends Disposable {
	Init() {
		if (Parser?.defaultRules?.link) this.patches = [
			Patcher.instead(Parser.defaultRules.link, "match", nop),
			Patcher.instead(Parser.defaultRules.subtext, "match", nop),
			Patcher.instead(subText, "match", nop),
		];
		else Logger.patchError("NoLinkPreview");
	}
}
