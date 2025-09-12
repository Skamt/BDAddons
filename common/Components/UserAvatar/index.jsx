import useStateFromStores from "@Modules/useStateFromStores";
import React, { LazyComponent } from "@React";
import PresenceStore from "@Stores/PresenceStore";
import { reactRefMemoFilter, waitForComponent } from "@Webpack";

const UserAvatar = waitForComponent(reactRefMemoFilter("type", "statusColor", "isTyping"), { searchExports: true });

export default ({ id, size, src }) => {
	const [status, isMobile] = useStateFromStores([PresenceStore], () => [PresenceStore.getStatus(id), PresenceStore.isMobileOnline(id)], [id]);

	return (
		<UserAvatar
			status={status}
			isMobile={isMobile}
			size={size}
			src={src}
		/>
	);
};
