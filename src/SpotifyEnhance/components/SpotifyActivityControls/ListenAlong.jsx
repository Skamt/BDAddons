import React from "@React";
import ActivityControlButton from "./ActivityControlButton";
import Tooltip from "@Components/Tooltip";
import { ListenAlongIcon } from "@Components/Icon";

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