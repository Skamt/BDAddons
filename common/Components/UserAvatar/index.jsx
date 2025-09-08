import useStateFromStores from "@Modules/useStateFromStores";
import React, { LazyComponent } from "@React";
import PresenceStore from "@Stores/PresenceStore";
import { Filters, getModule, waitForComponent } from "@Webpack";

const UserAvatarFilter = Filters.byStrings("statusColor", "isTyping");
const UserAvatar = waitForComponent(a => a?.type && UserAvatarFilter(a.type), { searchExports: true });


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
