import { Data, DOM, React, Patcher } from "@Api";

export default () => {
	return {
		start() {
			// console.log(css);
			let b = S.moduleById(77918).exports;
			Patcher.after(b.Z.rtype, "render", (context, args, ret) => {
				console.log(ret)
			});
		},
		stop() {
			Patcher.unpatchAll();
		}
	}
}