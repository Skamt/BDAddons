import Logger from "@Utils/Logger";
import { Disposable } from "@Utils";
import { Patcher } from "@Api";
import { getModule } from "@Webpack";

const a = getModule(a => a.useCanAccessGuildMemberModView);

export default class EnableModView extends Disposable {
	Init() {
		if (!a) return Logger.patch("EnableModView");
		this.patches = [
			Patcher.after(a, "useCanAccessGuildMemberModView", () => true), 
			Patcher.after(a, "canAccessGuildMemberModViewWithExperiment", () => true)
		];
	}
}
