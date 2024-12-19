import { Patcher, React } from "@Api";
import ErrorBoundary from "@Components/ErrorBoundary";
import Tooltip from "@Components/Tooltip";
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
			<Tooltip note={`${canEmbed ? "Can" : "Can't"} Embed links`}>
				<div
					style={{
						width: 24,
						height: 24,
						filter: canEmbed ? "grayscale(0)" : "grayscale(1)",
						background: "url(https://discord.com/assets/4af067a9e0a1fbf624e4.svg)"
					}}
				/>
			</Tooltip>

			<Tooltip note={`${canExternalEmojis ? "Can" : "Can't"} use external emojis`}>
				<div
					style={{
						width: 24,
						height: 24,
						filter: canExternalEmojis ? "grayscale(0)" : "grayscale(1)",
						background: "url(https://discord.com/assets/6cec8716b466d02f9703.svg)"
					}}
				/>
			</Tooltip>
		</div>
	);
}

export default class ShowChannelPerms extends Disposable {
	Init() {
		const { module, key } = ChannelTextArea;
		if (!module || !key) return Logger.patchError("ChannelTextArea");
		this.patches = [
			Patcher.after(module, key, (_, [{ channel }], ret) => {
				const currentUser = UserStore.getCurrentUser();

				return (ret.props.children = [
					// eslint-disable-next-line react/jsx-key
					<ErrorBoundary id="ShowChannelPerms">
						<Display
							channel={channel}
							user={currentUser}
						/>
					</ErrorBoundary>,
					ret.props.children
				]);
			})
		];
	}
}
