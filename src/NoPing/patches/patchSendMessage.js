import { before } from "@common/Patcher";
import Blacklist from "@/blacklist";
import MessageActions from "@Modules/MessageActions";
import Plugin from "@common/Plugin";

Plugin.onStart(() => {
	before(MessageActions, "_sendMessage", ({ args }) => {
		const userMentions = [...args[1].content.matchAll(/<@(\d+)>/gi)].map(a => a[1]);

		args[2].allowedMentions = {
			...args[2].allowedMentions,
			users: args[2].allowedMentions?.users ?? userMentions.filter(id => !Blacklist.has(id))
		};
	});
});
