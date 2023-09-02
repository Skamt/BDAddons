import css from "./styles";
import { DOM, React, Patcher } from "@Api";
import Logger from "@Utils/Logger";

import TimeBar from "@Components/TimeBar";

const comp = [
	<TimeBar
		start={Date.now()}
		end={Date.now() / 0.9999999}
	/>,
	// <TimeBar
	// 	start={Date.now()}
	// 	end={Date.now() / 0.999999}
	// />,
	// <TimeBar
	// 	start={Date.now()}
	// 	end={Date.now() / 0.99999}
	// />,
	// <TimeBar
	// 	start={Date.now()}
	// 	end={Date.now() / 0.9999}
	// />,
	// <TimeBar
	// 	start={Date.now()}
	// 	end={Date.now() / 0.999}
	// />
];

BdApi.alert("", comp);

export default () => {
	return {
		start() {
			DOM.addStyle(css);
		},
		stop() {
			DOM.removeStyle();
			Patcher.unpatchAll();
		}
	};
};
