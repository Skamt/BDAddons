import { someHelperFunction } from "./utils.js";
import config from "@Config";
import { openModal } from "@Utils/Modals";

module.exports = () => {
	return {
		start() {
			console.log(config);
		},
		stop() {}
	};
};
