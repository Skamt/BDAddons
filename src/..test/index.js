import { DOM, Patcher, React } from "@Api";
// import Tooltip from "@Components/Tooltip";
import Button from "@Components/Button";
import ErrorBoundary from "@Components/ErrorBoundary";
// import ShareIcon from "@Components/icons/ShareIcon";
// import { getInternalInstance } from "@Api";
import ModalRoot from "@Modules/ModalRoot";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import { getImageModalComponent, openModal } from "@Utils";
import Logger from "@Utils/Logger";
import css from "./styles";
const { closeModal, Popout, MenuItem, Menu, MenuGroup } = TheBigBoyBundle;

const Collapsible = s(193544).exports.default;

const b = BdApi.showConfirmationModal("", <T />);

function T() {
	return (
		<Collapsible
			changeTitle="Change Verification Level"
			value={0}
			options={[
				{
					"title": "None",
					"description": "Unrestricted",
					"highlightColor": "transparent",
					"value": 0,
					"disabled": false
				},
				{
					"title": "Low",
					"description": "Must have a verified email on their Discord account.",
					"highlightColor": "statusGreen",
					"value": 1
				},
				{
					"title": "Medium",
					"description": "Must also be registered on Discord for longer than 5 minutes.",
					"highlightColor": "statusYellow",
					"value": 2
				},
				{
					"title": "High",
					"description": "Must also be a member of this server for longer than 10 minutes.",
					"highlightColor": "statusOrange",
					"value": 3
				},
				{
					"title": "Highest",
					"description": "Must have a verified phone on their Discord account.",
					"highlightColor": "statusRed",
					"value": 4
				}
			]}
			disabled={false}>
			
		</Collapsible>
	);
}

export default () => {
	return {
		start() {
			DOM.addStyle(css);
		},
		stop() {
			closeModal(b);
			DOM.removeStyle();
			Patcher.unpatchAll();
		}
	};
};
