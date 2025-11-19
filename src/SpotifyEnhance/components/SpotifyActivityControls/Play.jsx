import React from "@React";
import ActivityControlButton from "./ActivityControlButton";
import Tooltip from "@Components/Tooltip";
import { ListenIcon } from "@Components/Icon";

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
