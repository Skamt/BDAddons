import { Patcher } from "@Api";


module.exports = () => ({
	start() {
		Patcher;
	},
	stop() {
		Patcher.unpatchAll();
	}
});
