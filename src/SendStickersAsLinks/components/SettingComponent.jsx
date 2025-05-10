import React from "@React";
import Settings from "@Utils/Settings";
import Heading from "@Modules/Heading";
import Slider from "@Modules/Slider";
import FormText from "@Modules/FormText";
import SettingSwtich from "@Components/SettingSwtich";

export default () => {
	return [
		...[
			{
				settingKey: "sendDirectly",
				description: "Send Directly",
				note: "Send the sticker link in a message directly instead of putting it in the chat box."
			},
			{
				settingKey: "ignoreEmbedPermissions",
				description: "Ignore Embed Permissions",
				note: "Send sticker links regardless of embed permissions, meaning links will not turn into images."
			},
			{
				settingKey: "shouldSendAnimatedStickers",
				description: "Send animated stickers",
				note: "Animated stickers do not animate, sending them will only send the first picture of the animation. (still useful)"
			},
			{
				settingKey: "shouldHighlightAnimated",
				description: "Highlight animated stickers"
			}
		].map(SettingSwtich),
		// eslint-disable-next-line react/jsx-key
		<StickerSize />
	];
};

function StickerSize() {
	const [val, set] = Settings.useSetting("stickerSize");
	return (
		<>
			<Heading
				style={{ marginBottom: 20 }}
				tag="h5">
				Sticker Size
			</Heading>
			<Slider
				className="stickerSizeSlider"
				stickToMarkers={true}
				sortedMarkers={true}
				equidistant={true}
				markers={[80, 100, 128, 160]}
				minValue={80}
				maxValue={160}
				initialValue={val}
				onValueChange={set}
			/>
			<FormText type="description">The size of the sticker in pixels. 160 is recommended</FormText>
		</>
	);
}
