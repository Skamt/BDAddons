import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import Blacklist from "@/blacklist";
import MessageActions from "@Modules/MessageActions";
import Plugin, { Events } from "@Utils/Plugin";

Plugin.on(Events.START, () => {
	if (!MessageActions) return Logger.patchError("patchSendMessage");
	Patcher.before(MessageActions, "_sendMessage", (_, args) => {
		const [, id] = args[1].content.match(/<@(\d+)>/) || [];
		if (!id) return;
		if (!Blacklist.has(id)) return;
		args[2].flags = 4096;
	});
});
