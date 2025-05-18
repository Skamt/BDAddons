import useStateFromStores from "@Modules/useStateFromStores";
import React from "@React";
import PresenceStore from "@Stores/PresenceStore";
import { Filters, getModule } from "@Webpack";

const UserAvatarFilter = Filters.byStrings("statusColor", "isTyping");
const UserAvatar = getModule(a => a?.type && UserAvatarFilter(a.type), { searchExports: true });

export default UserAvatar &&
	(({ id, size, src }) => {
		const [status, isMobile] = useStateFromStores([PresenceStore], () => [PresenceStore.getStatus(id), PresenceStore.isMobileOnline(id)], [id]);

		return (
			<UserAvatar
				status={status}
				isMobile={isMobile}
				size={size}
				src={src}
			/>
		);
	});
