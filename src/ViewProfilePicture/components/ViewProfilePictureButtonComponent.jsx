import { React } from "@Api";
import { useSettings } from "@Utils/Hooks";
import Tooltip from "@Components/Tooltip";
import ImageIcon from "@Components/ImageIcon";

export default props => {
	const showOnHover = useSettings("showOnHover");
	if(showOnHover) props.className += " VPP-hover";
	return (
		<Tooltip note="View profile picture">
			<div
				{...props}
				className={props.className}>
				<ImageIcon />
			</div>
		</Tooltip>
	);
};
