import React from "@React";
import { reRender } from "@Utils";
import Toast from "@Utils/Toast";
import MessageActions from "@Modules/MessageActions";
import ChannelsStateManager from "../ChannelsStateManager";
import Switch from "@Components/Switch";
import Button from "@Components/Button";
import { COMPONENT_ID, REGEX } from "../Constants";

function loadChannelMessages(channel) {
	/**
	 * This method of fetching messages makes API request without checking the cache
	 * therefore it is only called when messages.length === 0
	 * and because it returns a promise, it is used to load messages and show toast
	 * Debating removing this whole loadmessages feature.
	 */
	return MessageActions.fetchMessages({ channelId: channel.id });
}

const filters = {
	attachments: type => a => a.content_type?.includes("type") || REGEX[type].test(a.filename),
	embeds: type => e => e.type === type
};

function getChannelStats(messages) {
	return messages.reduce(
		(stats, { reactions, embeds, attachments }) => {
			stats.reactions += reactions.length;
			stats.embeds += embeds.filter(e => e.type?.includes("rich")).length;
			stats.links += embeds.filter(e => e.type?.includes("rich")).length;
			stats.images += attachments.filter(filters.attachments("image")).length + embeds.filter(filters.embeds("image")).length;
			stats.videos += attachments.filter(filters.attachments("video")).length + embeds.filter(filters.embeds("video")).length;
			return stats;
		},
		{ messages: messages.length, reactions: 0, embeds: 0, links: 0, images: 0, videos: 0 }
	);
}

export default ({ channel, loadChannel, messages }) => {
	const [blink, setBlink] = React.useState("");
	const [checked, setChecked] = React.useState(false);
	const channelStats = getChannelStats(messages);

	const loadMessagesHandler = () => {
		if (channelStats.messages) Toast.warning("Messages are already Loaded!!");
		else
			loadChannelMessages(channel).then(() => {
				Toast.success("Messages are Loaded!!");
				startBlinking();
			});
	};

	const startBlinking = () => {
		setBlink("blink");
		setTimeout(() => setBlink(""), 1200);
	};

	const loadChannelHandler = () => {
		if (checked) ChannelsStateManager.add("channels", channel.id);
		loadChannel(channel);
		/**
		 * rerending like this because i needed this component to be removed from the vDom
		 * otherwise some stores don't get updated since this component is replacing
		 * a context provider, i could just throw a minor error instead, not sure which is better.
		 */
		reRender(`#${COMPONENT_ID}`);
	};

	/**
	 * visibility set to hidden by default because when the plugin unloads
	 * the css is removed while the component is still on screen,
	 * and it looks like a Steaming Pile of Hot Garbage
	 */
	return (
		<div
			id={COMPONENT_ID}
			style={{ "visibility": "hidden", "height": "100%" }}>
			<div className="logo" />
			<Channel channel={channel} />
			<div className="title">Lazy loading is Enabled!</div>
			<div className="description">
				This channel is lazy loaded, If you want to auto load this channel in the future, make sure you enable <b>Auto load</b> down below before you load it.
			</div>
			<div className="controls">
				<div className="buttons-container">
					<Button
						onClick={loadChannelHandler}
						color={Button?.Colors?.GREEN}
						size={Button?.Sizes?.LARGE}>
						Load Channel
					</Button>
					<Button
						onClick={loadMessagesHandler}
						color={Button?.Colors?.PRIMARY}
						look={Button?.Looks?.OUTLINED}
						size={Button?.Sizes?.LARGE}>
						Load Messages
					</Button>
				</div>
				<Switch
					label="Auto load"
					className={`${checked} switch`}
					value={checked}
					onChange={setChecked}>
					
				</Switch>
			</div>
			{!channelStats.messages || (
				<div className={`stats ${blink}`}>
					{Object.entries(channelStats).map(([label, stat], index) => (
						<div key={`${label}-${index}`}>
							{label}: {stat}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

function Channel({ channel }) {
	const isDm = channel.guild_id === null;
	return isDm ? (
		<div className="DM">
			<div className="DMName">{channel.rawRecipients.map(a => `@${a.username}`).join(", ")}</div>
		</div>
	) : (
		<div className="channel">
			<div className="channelIcon">
				<svg
					role="img"
					aria-label="channel-icon"
					width="24"
					height="24"
					viewBox="0 0 24 24">
					<path
						fill="currentColor"
						fillRule="evenodd"
						clipRule="evenodd"
						d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41045 9L8.35045 15H14.3504L15.4104 9H9.41045Z" />
				</svg>
			</div>
			<div className="channelName">{channel.name}</div>
		</div>
	);
}
