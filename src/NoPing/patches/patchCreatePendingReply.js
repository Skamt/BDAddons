import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import { getModule } from "@Webpack";
import blacklist from "../blacklist.js";

const ReplyFunctions = getModule(a => a.createPendingReply);

export default () => {
	if (!ReplyFunctions) return Logger.patch("patchCreatePendingReply");

	Patcher.before(ReplyFunctions, "createPendingReply", (_, [args]) => {
		if (blacklist.has(args.message.author.id)) {
			args.shouldMention = false;
		}
		args.showMentionToggle = true;
	});
};
