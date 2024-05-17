import Logger from "@Utils/Logger";
import { Filters, getModule } from "@Webpack";
import { Patcher, React } from "@Api";
import { Disposable } from "@Utils";

const Parser = getModule(Filters.byProps("parseEmbedTitle", "defaultRules"));
export default class NoLinkPreview extends Disposable {
	Init() {
		if (Parser?.defaultRules?.link) this.patches = [Patcher.instead(Parser.defaultRules.link, "match", () => {})];
		else Logger.patch("NoLinkPreview");
	}
}
