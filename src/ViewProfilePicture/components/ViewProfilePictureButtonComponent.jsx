import { React } from "@Api";
import Settings from "@Utils/Settings";
import Tooltip from "@Components/Tooltip";
import ImageIcon from "@Components/icons/ImageIcon";

export default ({ className, onClick }) => {
	const showOnHover = Settings(Settings.selectors.showOnHover);
	if (showOnHover) className += " VPP-hover";
	return (
		<Tooltip note="View profile picture">
			<div
				onClick={onClick}
				className={className}>
				<ImageIcon />
			</div>
		</Tooltip>
	);
};
