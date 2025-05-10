import React from "@React";
import Button from "@Components/Button";

export default function ActivityControlButton({ value, onClick, className, ...rest }) {
	return (
		<Button
			innerClassName="flexCenterCenter"
			className={"spotify-activity-btn " + className}
			grow={false}
			size={Button.Sizes.NONE}
			color={Button.Colors.PRIMARY}
			look={Button.Colors.OUTLINED}
			onClick={onClick}
			{...rest}>
			{value}
		</Button>
	);
}