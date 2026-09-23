import React from "@React";
import { preventDefault } from "@Utils";
import Button from "@Components/Button";
import Tooltip from "@Components/Tooltip";

export default function ControlButton({ className, ref, onClick, tooltip, value, ...rest }) {
	const btn = (
		<Button
			onClick={preventDefault(onClick)}
			buttonRef={ref}
			innerClassName="flexCenterCenter"
			className={className}
			size={Button.Sizes.NONE}
			color={Button.Colors.PRIMARY}
			look={Button.Looks.BLANK}
			{...rest}>
			{value}
		</Button>
	);
	return !tooltip ? btn : <Tooltip note={tooltip}>{btn}</Tooltip>;
}

