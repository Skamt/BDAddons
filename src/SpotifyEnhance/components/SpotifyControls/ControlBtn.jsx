import React from "@React";
import Button from "@Components/Button";
import { preventDefault } from "@Utils";
export default function ControlBtn({ value, onClick, ...rest }) {
	return (
		<Button
			size={Button.Sizes.TINY}
			color={Button.Colors.GREEN}
			onClick={preventDefault(onClick)}
			{...rest}>
			{value}
		</Button>
	);
}
