import React from "@React";
import Tooltip from "@Modules/Tooltip";

export default ({ note, position, children }) => {
	return (
		<Tooltip
			text={note}
			position={position || "top"}>
			{props =>
				React.cloneElement(children, {
					...props,
					...children.props
				})
			}
		</Tooltip>
	);
};
