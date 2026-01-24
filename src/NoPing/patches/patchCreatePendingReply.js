import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import { getModuleAndKey, Filters } from "@Webpack";
import Blacklist from "@/blacklist";
import Plugin, { Events } from "@Utils/Plugin";

import Settings from "@Utils/Settings";
const ReplyFunctions = getModuleAndKey(Filters.byStrings("CREATE_PENDING_REPLY", "dispatch"), { searchExports: true });

Plugin.on(Events.START, () => {
	const { module, key } = ReplyFunctions;
	if (!module || !key) return Logger.patchError("patchCreatePendingReply");

	Patcher.before(module, key, (_, [args]) => {
		if (Blacklist.has(args.message.author.id)) args.shouldMention = false;
		if (Settings.state.mentionToggle) args.showMentionToggle = true;
	});
});
