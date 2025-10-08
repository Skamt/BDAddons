// import "./styles";
import Store from "@/store";
import { classNameFactory, join } from "@Utils/css";
import useStateFromStores from "@Modules/useStateFromStores";
import ReadStateStore from "@Stores/ReadStateStore";

const c = classNameFactory("roles-list");

function RolesList({ guildId, userId }) {
	const roles = Store(Store.selectors.roles);

	return (
		<div className={c("container")}>
		</div>
	);
}

export default RolesList;
