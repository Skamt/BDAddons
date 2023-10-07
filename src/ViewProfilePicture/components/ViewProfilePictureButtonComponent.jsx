import { React } from "@Api";
import { useSettings } from "@Utils/Hooks";
import Tooltip from "@Components/Tooltip";
import ImageIcon from "@Components/ImageIcon";

export default props => {
	const showOnHover = useSettings("showOnHover");
	return (
		<Tooltip note="View profile picture">
			<div
				{...props}
				className={`${props.className} ${showOnHover && "VPP-hover"}`}>
				<ImageIcon />
			</div>
		</Tooltip>
	);
};
