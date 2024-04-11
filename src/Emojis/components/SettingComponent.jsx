import {  React } from "@Api";
import Switch from "@Components/Switch";
import Settings from "@Utils/Settings";

import TheBigBoyBundle from "@Modules/TheBigBoyBundle";

const { FormText, Slider, Heading } = TheBigBoyBundle.Heading;

export default () => {
	return [
		...[
			{
				hideBorder: false,
				description: "Send Directly",
				note: "Send the emoji link in a message directly instead of putting it in the chat box.",
				value: Settings.get("sendDirectly"),
				onChange: e => Settings.set("sendDirectly", e)
			},
			{
				hideBorder: false,
				description: "Ignore Embed Permissions",
				note: "Send emoji links regardless of embed permissions, meaning links will not turn into images.",
				value: Settings.get("ignoreEmbedPermissions"),
				onChange: e => Settings.set("ignoreEmbedPermissions", e)
			},
			{
				hideBorder: false,
				description: "Send animated stickers",
				note: "Animated emojis are sent as GIFs, making most of them hidden by discord's GIF tag.",
				value: Settings.get("shouldSendAnimatedEmojis"),
				onChange: e => Settings.set("shouldSendAnimatedEmojis", e)
			},
			{
				hideBorder: false,
				description: "Send animated as webp",
				note: "Meaning the emoji will show only the first frame, making them act as normal emoji, unless the first frame is empty.",
				value: Settings.get("sendEmojiAsWebp"),
				onChange: e => Settings.set("sendEmojiAsWebp", e)
			},
			{
				hideBorder: false,
				description: "Highlight animated emoji",
				value: Settings.get("shouldHihglightAnimatedEmojis"),
				onChange: e => Settings.set("shouldHihglightAnimatedEmojis", e)
			}
		].map(Toggle),
		// eslint-disable-next-line react/jsx-key
		<StickerSize />
	];
};

function StickerSize() {
	return (
		<>
			<Heading
				style={{ marginBottom: 20 }}
				tag="h5">
				Emoji Size
			</Heading>
			<Slider
				className="emojiSizeSlider"
				stickToMarkers={true}
				markers={[40, 48, 60, 64, 80, 96]}
				minValue={40}
				maxValue={96}
				initialValue={Settings.get("emojiSize")}
				onValueChange={e => Settings.set("emojiSize", e)}
			/>
			<FormText type="description">The size of the Emoji in pixels.</FormText>
		</>
	);
}

function Toggle(props) {
	const [enabled, setEnabled] = React.useState(props.value);
	return (
		<Switch
			value={enabled}
			note={props.note}
			hideBorder={props.hideBorder}
			onChange={e => {
				props.onChange(e);
				setEnabled(e);
			}}>
			{props.description}
		</Switch>
	);
}
