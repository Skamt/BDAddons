import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import blacklist from "../blacklist.js";
import MessageActions from "@Modules/MessageActions";

export default () => {
	if (!MessageActions) return Logger.patch("patchSendMessage");
	Patcher.before(MessageActions, "_sendMessage", (_, args) => {
		const [, id] = args[1].content.match(/<@(\d+)>/) || [];
		if (!id) return;
		if (!blacklist.has(id)) return;
		args[2].flags = 4096;
	});
};
