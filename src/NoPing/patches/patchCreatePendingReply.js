import { before } from "@common/Patcher";
import { getModuleAndKey, Filters } from "@Webpack";
import Blacklist from "@/blacklist";
import Plugin from "@common/Plugin";
import Settings from "@Settings";

const ReplyFunctions = getModuleAndKey(Filters.byStrings("CREATE_PENDING_REPLY", "dispatch"), { searchExports: true });

Plugin.onStart(() => {
	before(...ReplyFunctions, ({ args: [props] }) => {
		if (Blacklist.has(props.message.author.id)) props.shouldMention = false;
		if (Settings.state.mentionToggle) props.showMentionToggle = true;
	});
});
