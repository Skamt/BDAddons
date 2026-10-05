import "./styles";
import Plugin from "@common/Plugin";
import SettingSwtich from "@Components/SettingSwtich";
import Settings from "@Settings";
import { copy } from "@Utils";
import Toast from "@Utils/Toast";
import { after } from "@common/Patcher";
import { Filters, lazy } from "@Webpack";
import React, { insertChild } from "@React";
import Tooltip from "@Components/Tooltip";

function MessageHeaderItems({ username, userId }) {
	const showId = Settings.showId();

	return [
		<Tooltip note="copy username">
			<span
				onClick={() => {
					copy(username);
					Toast.success("Username Copied!");
				}}
				className="messageHeaderItem">
				{`@${username}`}
			</span>
		</Tooltip>,
		showId && (
			<Tooltip note="Copy user id">
				<span
					onClick={() => {
						copy(userId);
						Toast.success("ID Copied!");
					}}
					className="messageHeaderItem">
					{userId}
				</span>
			</Tooltip>
		)
	];
}

Plugin.onStart(() => {
	lazy(Filters.byStrings("userOverride", "withMentionPrefix"), { searchExports: false }).then(MessageHeader => {
		after(...MessageHeader, ({ args: [{ compact, message }], ret }) => {
			if (compact) return;
			insertChild(
				ret,
				<MessageHeaderItems
					username={message.author.username}
					userId={message.author.id}
				/>
			);
		});
	});
});

Plugin.getSettingsPanel = () => () =>
	[
		{
			description: "Show user ID",
			setting: Settings.showId
		}
	].map(SettingSwtich);
module.exports = () => Plugin;
