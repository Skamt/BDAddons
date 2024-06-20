import Logger from "@Utils/Logger";
import { Disposable } from "@Utils";
import { Patcher, React } from "@Api";
import { getModule, waitForModule, Filters } from "@Webpack";
import RelationshipStore from "@Stores/RelationshipStore";
import useStateFromStores from "@Modules/useStateFromStores";
import ErrorBoundary from "@Components/ErrorBoundary";

const UserPopout = waitForModule(Filters.byStrings(",showCopiableUsername:", ",showBorder:"), { defaultExport: false });
const getCreatedAtDate = getModule(Filters.byStrings("getTime", "short"), { searchExports: true });

function D({ userId }) {
	const since = useStateFromStores([RelationshipStore], () => {
		const since = RelationshipStore.getSince(userId);

		if (since && RelationshipStore.isFriend(userId)) return getCreatedAtDate(since);
		return null;
	});
	return since ? <p style={{ userSelect: "text", color: "#fff" }}>Friends since: {since}</p> : null;
}

async function patchUserPopout(m) {
	// const filterForPopout = BdApi.Webpack.Filters.byStrings(",guildMember:", ".title", ".body");
	return Patcher.after(m, "Z", (_, [props], ret) => {
		const children = ret?.props?.children?.[1]?.props?.children?.[2]?.props?.children;
		if (!children) return;
		// const index = children.findIndex(m => filterForPopout(m?.type));
		// if (!~index) return;
		children.splice(
			3,
			0,
			<ErrorBoundary
				id="FriendsSince"
				plugin={config.info.name}>
				<D userId={props.user.id} />
			</ErrorBoundary>
		);
	});
}

export default class FriendsSince extends Disposable {
	async Init() {
		const m = await UserPopout;
		if (!m) return Logger.patch("FriendsSince");
		this.patches = [await patchUserPopout(m)];
	}
}
