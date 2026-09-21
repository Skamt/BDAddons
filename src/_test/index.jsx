import Plugin from "@common/Plugin";
import { showConfirmationModal } from "@Api";
import React from "@React";
import { preventDefault } from "@Utils";
import Button, { ManaButton } from "@Components/Button";
import Tooltip from "@Components/Tooltip";
import { MuteVolumeIcon, NextIcon } from "@Components/Icon";

// function ControlButton({ className, ref, active, onClick, tooltip, value, ...rest }) {
// 	const btn = (
// 		<Button
// 			onClick={preventDefault(onClick)}
// 			buttonRef={ref}
// 			innerClassName="flexCenterCenter"
// 			className={className}
// size={Button.Sizes.NONE}
// color={Button.Colors.PRIMARY}
// look={Button.Looks.BLANK}
// 			{...rest}>
// 			{value}
// 		</Button>
// 	);
// 	return !tooltip ? btn : <Tooltip note={tooltip}>{btn}</Tooltip>;
// }

function Asdasd() {
	return (
		<>
			<Button size={Button.Sizes.ICON} color={Button.Colors.CUSTOM} look={Button.Looks.FILLED}>
				<MuteVolumeIcon />
			</Button>
			<Button size={Button.Sizes.ICON} color={Button.Colors.CUSTOM} look={Button.Looks.FILLED}>
				<NextIcon />
			</Button>

			<ManaButton
				variant="icon-only"
				size="sm"
				icon={() => <MuteVolumeIcon width="18" height="18" />}
			/>

			<ManaButton variant="icon-only" size="sm" icon={() => <NextIcon width="18" height="18" />} />
		</>
	);
}
Plugin.onStart((e) => {
	showConfirmationModal("d", <Asdasd />);
});

module.exports = () => Plugin;

console.log(ManaButton, Button);
