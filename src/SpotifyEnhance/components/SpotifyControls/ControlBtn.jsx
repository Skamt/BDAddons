import React from "@React";
import Button from "@Components/Button";

export default function ControlBtn({ value, onClick, ...rest }) {
	return (
		<Button
			size={Button.Sizes.TINY}
			color={Button.Colors.GREEN}
			onClick={onClick}
			{...rest}>
			{value}
		</Button>
	);
}
