import Logger from "@Utils/Logger";
import { Disposable } from "@Utils";
import { Patcher } from "@Api";
// import { Filters, getModule } from "@Webpack";

// const a = getModule(a => a.useCanAccessGuildMemberModView);

// eslint-disable-next-line no-undef
const a = s.getSource("checkElevated","autoTrackExposure")?.module?.exports;

export default class EnableModView extends Disposable {
	Init() {
		if (!a) return Logger.patch("EnableModView");

		for(const key in a){
			this.patches.push(Patcher.after(a, key,() => true));
		}
	}
}
