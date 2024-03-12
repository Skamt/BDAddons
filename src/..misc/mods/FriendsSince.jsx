import Logger from "@Utils/Logger";
import { Disposable } from "@Utils";
import { Patcher, React } from "@Api";
import { waitForModule, Filters } from "@Webpack";
import RelationshipStore from "@Stores/RelationshipStore";
import FluxHelpers from "@Modules/FluxHelpers";
import ErrorBoundary from "@Components/ErrorBoundary";

const UserPopout = waitForModule(Filters.byStrings(",showCopiableUsername:", ",showBorder:"), { defaultExport: false });
const userProfileUtils = BdApi.Webpack.getByKeys("getCreatedAtDate");

function D({ userId }) {
	const since = FluxHelpers.useStateFromStores([RelationshipStore], () => {
		const since = RelationshipStore.getSince(userId);

		if (since && RelationshipStore.isFriend(userId)) return userProfileUtils.getCreatedAtDate(since);
		return null;
	});
	return since ? <p style={{color:"#fff"}}>Friends since: {since}</p> : null;
}

async function patchUserPopout() {
	const m = await UserPopout;
	const filterForPopout = BdApi.Webpack.Filters.byStrings(",guildMember:", ".title", ".body");
	return Patcher.after(m, "default", (_, [props], ret) => {
		const children = ret?.props?.children?.[1]?.props?.children?.[2]?.props?.children;
		if (!children) return;
		const index = children.findIndex(m => filterForPopout(m?.type));
		if (!~index) return;
		children.splice(
			index + 1,
			0,
			<ErrorBoundary
				id="FriendsSince"
				plugin={config.info.name}>
				<D userId={props.user.id} />
			</ErrorBoundary>
		);
	});
}

async function patchUserModal() {}

export default class FriendsSince extends Disposable {
	async Init() {
		this.patches = [await patchUserPopout()];
	}
}
