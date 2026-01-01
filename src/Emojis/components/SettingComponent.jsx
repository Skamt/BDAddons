import React from "@React";
import SettingSwtich from "@Components/SettingSwtich";
import Settings from "@Utils/Settings";
import Heading from "@Modules/Heading";
import Slider from "@Modules/Slider";
import FieldSet from "@Components/FieldSet";

const sizes = [48, 56, 60, 64, 80, 96, 100, 128, 160, 240, 256, 300];

function StickerSize() {
	const [val, set] = Settings.useSetting("emojiSize");
	return (
		<Slider
			className="emojiSizeSlider"
			label="Emoji Size"
			description="The size of the Emoji in pixels"
			stickToMarkers={true}
			sortedMarkers={true}
			equidistant={true}
			markers={sizes}
			minValue={sizes[0]}
			maxValue={sizes[sizes.length - 1]}
			initialValue={val}
			onValueChange={e => set(sizes.find(s => e <= s) ?? sizes[sizes.length - 1])}
		/>
	);
}

export default () => {
	return (
		<FieldSet contentGap={8}>
			{[
				{
					border: true,
					description: "Send Directly",
					note: "Send the emoji link in a message directly instead of putting it in the chat box.",
					settingKey: "sendDirectly"
				},
				{
					border: true,
					description: "Ignore Embed Permissions",
					note: "Send emoji links regardless of embed permissions, meaning links will not turn into images.",
					settingKey: "ignoreEmbedPermissions"
				},
				{
					border: true,
					description: "Send animated emojis",
					note: "Animated emojis are sent as GIFs.",
					settingKey: "shouldSendAnimatedEmojis"
				},
				{
					border: true,
					description: "Send animated as png",
					note: "Meaning the emoji will show only the first frame, making them act as normal emoji, unless the first frame is empty.",
					settingKey: "sendEmojiAsPng"
				},
				{
					border: true,
					description: "Highlight animated emoji",
					settingKey: "shouldHihglightAnimatedEmojis"
				}
			].map(SettingSwtich)}
			<StickerSize />
		</FieldSet>
	);
};
