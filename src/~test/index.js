import { React, Patcher } from "@Api";
import Logger from "@Utils/Logger";


export default () => {
	return {
		start() {
			// console.log(css);
			// let b = S.moduleById(966935).exports;
			// let a = S.moduleById(285991).exports.PR;
			// Patcher.after(b, "B", (context, args, ret) => {
				
			// });
		},
		stop() {
			Patcher.unpatchAll();
		}
	};
};
