import { React } from "@Api";
import ActivityControlButton from "./ActivityControlButton";
import ListenIcon from "@Components/icons/ListenIcon";
import Tooltip from "@Components/Tooltip";


export default function Play({ userPlayActivityState }) {
	const { label, disabled, onClick, tooltip } = userPlayActivityState;

	return (
		<Tooltip note={tooltip || label}>
			<ActivityControlButton
				disabled={disabled}
				fullWidth={true}
				className="spotify-activity-btn-listen"
				value={<ListenIcon />}
				onClick={onClick}
			/>
		</Tooltip>
	);
}