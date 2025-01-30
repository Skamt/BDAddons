import { React } from "@Api";
import SettingSwtich from "@Components/SettingSwtich";
import Settings from "@Utils/Settings";
import Heading from "@Modules/Heading";
import Slider from "@Modules/Slider";
import FormText from "@Modules/FormText";

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
					description: "Send animated emojis",
					note: "Animated emojis are sent as GIFs.",
					settingKey: "shouldSendAnimatedEmojis"
				},
				{
					description: "Send animated as png",
					note: "Meaning the emoji will show only the first frame, making them act as normal emoji, unless the first frame is empty.",
					settingKey: "sendEmojiAsPng"
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

const emojiSizes = [48, 56, 60, 64, 80, 96, 100, 128, 160, 240, 256, 300];

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
				sortedMarkers={true}
				equidistant={true}
				markers={emojiSizes}
				minValue={emojiSizes[0]}
				maxValue={emojiSizes[emojiSizes.length - 1]}
				initialValue={val}
				onValueChange={e => set(emojiSizes.find(s => e <= s) ?? emojiSizes[emojiSizes.length - 1])}
			/>
			<FormText type="description">The size of the Emoji in pixels</FormText>
		</>
	);
}
