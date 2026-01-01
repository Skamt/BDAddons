import React from "@React";
import Settings from "@Utils/Settings";
import Heading from "@Modules/Heading";
import Slider from "@Modules/Slider";
import SettingSwtich from "@Components/SettingSwtich";
import FieldSet from "@Components/FieldSet";

const sizes = [80, 100, 128, 160];

function StickerSize() {
	const [val, set] = Settings.useSetting("stickerSize");
	return (
		<Slider
			className="stickerSizeSlider"
			label="Sticker Size"
			description="The size of the sticker in pixels. 160 is recommended"
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
					settingKey: "sendDirectly",
					description: "Send Directly",
					note: "Send the sticker link in a message directly instead of putting it in the chat box."
				},
				{
					border: true,
					settingKey: "ignoreEmbedPermissions",
					description: "Ignore Embed Permissions",
					note: "Send sticker links regardless of embed permissions, meaning links will not turn into images."
				},
				{
					border: true,
					settingKey: "shouldSendAnimatedStickers",
					description: "Send animated stickers",
					note: "Animated stickers do not animate, sending them will only send the first picture of the animation. (still useful)"
				},
				{
					border: true,
					settingKey: "shouldHighlightAnimated",
					description: "Highlight animated stickers"
				}
			].map(SettingSwtich)}
			<StickerSize />
		</FieldSet>
	);
};
