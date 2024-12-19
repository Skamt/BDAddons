import Logger from "@Utils/Logger";
import { Filters, getModule } from "@Webpack";
import { Patcher, React } from "@Api";
import { nop, Disposable } from "@Utils";

const Parser = getModule(Filters.byProps("parseEmbedTitle", "defaultRules"));
const subText = getModule(a => a?.requiredFirstCharacters?.[0] == "-");
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
