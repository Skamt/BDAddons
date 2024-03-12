import { getModule, Filters } from "@Webpack";
import { Disposable } from "@Utils";
import { Patcher } from "@Api";
import Logger from "@Utils/Logger";

const PendingReply = getModule(a => a.createPendingReply);
export default class NoReplyPing extends Disposable {
	Init() {
		if (PendingReply)
			this.patches = [
				Patcher.before(PendingReply, "createPendingReply", (_, [args]) => {
					args.shouldMention = false;
					args.showMentionToggle = true;
				})
			];
		else Logger.patch("NoReplyPing");
	}
}
