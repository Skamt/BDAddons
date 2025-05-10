import React from "@React";
import ActivityControlButton from "./ActivityControlButton";
import ListenAlongIcon from "@Components/icons/ListenAlongIcon";
import Tooltip from "@Components/Tooltip";


export default function ListenAlong({ userSyncActivityState }) {
	const { disabled, onClick, tooltip } = userSyncActivityState;

	return (
		<Tooltip note={tooltip}>
			<ActivityControlButton
				className="spotify-activity-btn-listenAlong"
				disabled={disabled}
				onClick={e => onClick(e)}
				value={<ListenAlongIcon />}
			/>
		</Tooltip>
	);
}