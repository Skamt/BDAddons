import Logger from "@Utils/Logger";
import { Disposable } from "@Utils";
import { ContextMenu } from "@Api";
import Toast from "@Utils/Toast";
import FetchUser from "@Modules/FetchUser";

export default class Whois extends Disposable {
	Init() {
		this.patches.push(
			ContextMenu.patch("unknown-user-context", (retVal, { userId }) => {
				if (!userId) return;
				const MenuItem = BdApi.ContextMenu.buildItem({
					label: "Load User",
					action() {
						FetchUser(userId)
							.then(a => {
								Logger.log(`user loaded: ${userId} ${a.username}`);
								Toast.success("User Loaded!");
							})
							.catch(e => {
								Logger.error(e);
								Toast.error(`Could not load user: ${userId}`);
							});
					}
				});
				if (Array.isArray(retVal.props.children)) retVal.props.children.unshift(MenuItem);
				else retVal.props.children = [MenuItem, retVal.props.children];
			})
		);
	}
}
