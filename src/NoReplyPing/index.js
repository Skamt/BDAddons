import "./patches/*";
import Plugin from "@common/Plugin";
import { before } from "@common/Patcher";
import { getModule } from "@Webpack";

const PendingReply = getModule(a => a.createPendingReply);

Plugin.onStart(() => {
	before(PendingReply, "createPendingReply", ({ args: [args] }) => {
		args.shouldMention = false;
		args.showMentionToggle = true;
	});
});

module.exports = () => Plugin;
