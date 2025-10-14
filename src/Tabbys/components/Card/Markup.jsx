import React from "@React";
import useStateFromStores from "@Modules/useStateFromStores";
import ChannelStore from "@Stores/ChannelStore";
// import { Fallback } from "@/components/Icons";
import { getGroupDmIcon } from "@Utils/Channel";
import { join } from "@Utils/css";
import Settings from "@Utils/Settings";
import { getSize } from "@/utils";
import { getUserName } from "@Utils/User";
import { HideTitleContext } from "./context";

export default function Markup({ icon, title }) {
	const hideTitle = React.useContext(HideTitleContext);
	return (
		<>
			{icon}
			{!hideTitle && <div className="card-title">{title}</div>}
		</>
	);
}
