import { DOM, Patcher, React, showConfirmationModal } from "@Api";
// import Tooltip from "@Components/Tooltip";
import Button from "@Components/Button";
import ErrorBoundary from "@Components/ErrorBoundary";
import Flex from "@Components/Flex";
import Arrow from "@Components/Icons/Arrow";
import Tooltip from "@Components/Tooltip";
// import ShareIcon from "@Components/icons/ShareIcon";
// import { getInternalInstance } from "@Api";
import ModalRoot from "@Modules/ModalRoot";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import { getImageModalComponent, openModal } from "@Utils";
import { shallow } from "@Utils";
import Logger from "@Utils/Logger";
import Settings from "@Utils/Settings";
import css from "./styles";

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
