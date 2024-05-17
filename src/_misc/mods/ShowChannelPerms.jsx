import { Patcher, React } from "@Api";
import ErrorBoundary from "@Components/ErrorBoundary";
import Flex from "@Components/Flex";
import UserStore from "@Stores/UserStore";
import { Disposable } from "@Utils";
import Logger from "@Utils/Logger";
import { hasExternalEmojisPerms, hasEmbedPerms } from "@Utils/Permissions";
import { Filters, getModuleAndKey } from "@Webpack";

const ChannelTextArea = getModuleAndKey(Filters.byStrings("shouldShowLurkerModeSuccessPopout"));

function Display({ user, channel }) {
	const canEmbed = hasEmbedPerms(channel, user);
	const canExternalEmojis = hasExternalEmojisPerms(channel, user);
	return (
		<div className="perms-display">
			<div grow={0}>Can embed: {canEmbed ? "Yes" : "No"} </div>
			{"|"}
			<div grow={0}>Can external emoji: {canExternalEmojis ? "Yes" : "No"}</div>
		</div>
	);
}

export default class ShowChannelPerms extends Disposable {
	Init() {
		const { module, key } = ChannelTextArea;
		if (!module || !key) return Logger.patch("ChannelTextArea");
		this.patches = [
			Patcher.after(module, key, (_, [{ channel }], ret) => {
				const currentUser = UserStore.getCurrentUser();

				return (ret.props.children = [
					<Display
						channel={channel}
						user={currentUser}
					/>,
					ret.props.children
				]);
			})
		];
	}
}
