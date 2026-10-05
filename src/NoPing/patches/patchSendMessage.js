import { before } from "@common/Patcher";
import Settings from "@Settings";
import Blacklist from "@/blacklist";
import MessageActions from "@Modules/MessageActions";
import Plugin from "@common/Plugin";

Plugin.onStart(() => {
	before(MessageActions, "_sendMessage", ({ args }) => {
		if (!Settings.state.silent) return;
		const shouldSilent = args[1].content.matchAll(/<@(\d+)>/gi).some(match => Blacklist.has(match[1]));
		if (!shouldSilent) return;
		args[2].flags = 4096;
	});
});
