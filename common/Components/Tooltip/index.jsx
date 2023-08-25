import { React } from "@Api";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";

const { Tooltip } = TheBigBoyBundle;
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
