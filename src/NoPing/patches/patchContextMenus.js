import { ContextMenu } from "@Api";
import blacklist from "../blacklist.js";

export default () => {
	return [
		ContextMenu.patch("user-context", function (retVal, { user }) {
			// console.log(arguments);
			if (!user.id) return;

			retVal.props.children.splice(
				1,
				0,
				ContextMenu.buildItem({
					type: "toggle",
					label: "Never ping",
					active: blacklist.has(user.id),
					action: () => blacklist.toggle(user.id)
				})
			);
		})
	];
};
