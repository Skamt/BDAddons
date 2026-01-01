import { Patcher } from "@Api";
import Settings from "@Utils/Settings";
import Logger from "@Utils/Logger";
import Blacklist from "@/blacklist";
import MessageActions from "@Modules/MessageActions";
import Plugin, { Events } from "@Utils/Plugin";

Plugin.on(Events.START, () => {
	if (!MessageActions) return Logger.patchError("patchSendMessage");
	Patcher.before(MessageActions, "_sendMessage", (_, args) => {
		if (!Settings.state.silent) return;
		const shouldSilent = args[1].content.matchAll(/<@(\d+)>/gi).some(match => Blacklist.has(match[1]));
		if (!shouldSilent) return;
		args[2].flags = 4096;
	});
});
