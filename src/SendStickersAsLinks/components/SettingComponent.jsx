import { React } from "@Api";
import Switch from "@Components/Switch";
import Settings from "@Utils/Settings";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";

const Heading = TheBigBoyBundle.Heading;
const Slider = TheBigBoyBundle.Slider;
const FormText = TheBigBoyBundle.FormText;

export default () => {
	return [
		...[
			{
				hideBorder: false,
				description: "Send Directly",
				note: "Send the sticker link in a message directly instead of putting it in the chat box.",
				value: Settings.get("sendDirectly"),
				onChange: e => Settings.set("sendDirectly", e)
			},
			{
				hideBorder: false,
				description: "Ignore Embed Permissions",
				note: "Send sticker links regardless of embed permissions, meaning links will not turn into images.",
				value: Settings.get("ignoreEmbedPermissions"),
				onChange: e => Settings.set("ignoreEmbedPermissions", e)
			},
			{
				hideBorder: false,
				description: "Send animated stickers",
				note: "Animated stickers do not animate, sending them will only send the first picture of the animation. (still useful)",
				value: Settings.get("shouldSendAnimatedStickers"),
				onChange: e => Settings.set("shouldSendAnimatedStickers", e)
			},
			{
				hideBorder: false,
				description: "Highlight animated stickers",
				value: Settings.get("shouldHighlightAnimated"),
				onChange: e => Settings.set("shouldHighlightAnimated", e)
			}
		].map(Toggle),
		// eslint-disable-next-line react/jsx-key
		<StickerSize />
	];
};

function StickerSize() {
	return (
		<>
			<Heading tag="h5">Sticker Size</Heading>
			
			<Slider
				stickToMarkers={true}
				markers={[80, 100, 128, 160]}
				minValue={80}
				maxValue={160}
				initialValue={Settings.get("stickerSize")}
				onValueChange={e => Settings.set("stickerSize", e)}
			/>
			<FormText type="description">The size of the sticker in pixels. 160 is recommended</FormText>
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
