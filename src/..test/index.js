import css from "./styles";
import { DOM, React, Patcher } from "@Api";
import Logger from "@Utils/Logger";
import ErrorBoundary from "@Components/ErrorBoundary";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
// import Tooltip from "@Components/Tooltip";
import Button from "@Components/Button";
// import ShareIcon from "@Components/ShareIcon";
// import { getInternalInstance } from "@Api";
import ModalRoot from "@Modules/ModalRoot";
// const { closeModal, openModal, Popout, MenuItem, Menu, MenuGroup } = TheBigBoyBundle;



export default () => {
	return {
		start() {
			DOM.addStyle(css);
			// openModal([<Button>{"POOP"}</Button>,<Button>{"POOP"}</Button>,<Button>{"POOP"}</Button>]);
			
		},
		stop() {
			DOM.removeStyle();
			Patcher.unpatchAll();
		}
	};
};
