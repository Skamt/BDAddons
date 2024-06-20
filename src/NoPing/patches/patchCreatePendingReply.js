import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import { getModuleAndKey, Filters } from "@Webpack";
import blacklist from "../blacklist.js";

const ReplyFunctions = getModuleAndKey(Filters.byStrings("CREATE_PENDING_REPLY", "dispatch"), { searchExports:true })

export default () => {
	const {module, key} = ReplyFunctions;
	if (!module || !key) return Logger.patch("patchCreatePendingReply");

	Patcher.before(module, key, (_, [args]) => {
		if (blacklist.has(args.message.author.id)) {
			args.shouldMention = false;
		}
		args.showMentionToggle = true;
	});
};
