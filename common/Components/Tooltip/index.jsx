import { React } from "@Api";
import Tooltip from "@Modules/Tooltip";

export default ({ note, position, children }) => {
	return (
		<Tooltip
			text={note}
			position={position || "top"}>
			{props => {
				children.props = {
					...props,
					...children.props
				};
				return children;
			}}
		</Tooltip>
	);
};
