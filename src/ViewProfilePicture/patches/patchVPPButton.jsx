import config from "@Config";
import { Patcher, findInTree, React } from "@Api";
import { getNestedProp } from "@Utils";
import { join } from "@Utils/css";
import ErrorBoundary from "@Components/ErrorBoundary";
import ErrorIcon from "@Components/icons/ErrorIcon";
import Logger from "@Utils/Logger";
import Plugin, { Events } from "@Utils/Plugin";
import { Filters, waitForModule, getMangled, getModule } from "@Webpack";
import VPPButton from "../components/VPPButton";

const UserProfileModalforwardRef = getModule(Filters.byKeys("Overlay", "render"));

let wrapper;
waitForModule((a, _, id) => id === 587168).then(match => {
	wrapper = match.A;
});

const UserProfileBanner = getMangled(Filters.bySource("avatarOffsetX", "foreignObject"), {
	Banner: Filters.byStrings("canUsePremiumProfileCustomization")
});

Plugin.on(Events.START, () => {
	// User Profile Modal_V2
	Patcher.after(UserProfileBanner, "Banner", (_, [props], ret) => {
		if (props.themeType !== "MODAL_V2") return ret;
		return [
			ret,
			<ErrorBoundary
				id="VPPButton"
				plugin={config.info.name}
				fallback={<ErrorIcon className="VPP-Button" />}>
				<VPPButton
					className={join("VPP-Button", "VPP-float")}
					user={props.user}
					displayProfile={props.displayProfile}
				/>
			</ErrorBoundary>
		];
	});

	// Popout, Sidebar, Bot Profile
	Patcher.after(UserProfileModalforwardRef, "render", (_, [props], ret) => {
		// adds VPP-container anyway to help the previous patch
		ret.props.className = `${ret.props.className} VPP-container`;

		const target = findInTree(ret, a => wrapper && wrapper === a?.type, { walkable: ["props", "children"] });
		if (!target) return;

		const children = Array.isArray(target.props.children) ? target.props.children : [target.props.children];
		children.unshift(
			<ErrorBoundary
				id="VPPButton"
				plugin={config.info.name}
				fallback={<ErrorIcon className="VPP-Button" />}>
				<VPPButton
					className={join("VPP-Button")}
					user={props.user}
					displayProfile={props.displayProfile}
				/>
			</ErrorBoundary>
		);
		target.props.children = children;
	});
});
