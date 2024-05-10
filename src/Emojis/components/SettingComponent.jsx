import { React } from "@Api";
import SettingSwtich from "@Components/SettingSwtich";
import Settings from "@Utils/Settings";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
const { FormText, Slider, Heading } = TheBigBoyBundle;

export default () => {
	return (
		<>
			{[
				{
					description: "Send Directly",
					note: "Send the emoji link in a message directly instead of putting it in the chat box.",
					settingKey: "sendDirectly"
				},
				{
					description: "Ignore Embed Permissions",
					note: "Send emoji links regardless of embed permissions, meaning links will not turn into images.",
					settingKey: "ignoreEmbedPermissions"
				},
				{
					description: "Send animated stickers",
					note: "Animated emojis are sent as GIFs, making most of them hidden by discord's GIF tag.",
					settingKey: "shouldSendAnimatedEmojis"
				},
				{
					description: "Send animated as webp",
					note: "Meaning the emoji will show only the first frame, making them act as normal emoji, unless the first frame is empty.",
					settingKey: "sendEmojiAsWebp"
				},
				{
					description: "Highlight animated emoji",
					settingKey: "shouldHihglightAnimatedEmojis"
				}
			].map(SettingSwtich)}
			<StickerSize />
		</>
	);
};

function StickerSize() {
	const [val, set] = Settings.useSetting("emojiSize");

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
				initialValue={val}
				onValueChange={set}
			/>
			<FormText type="description">The size of the Emoji in pixels.</FormText>
		</>
	);
}
