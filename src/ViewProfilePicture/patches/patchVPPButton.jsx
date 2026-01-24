import config from "@Config";
import { Patcher, findInTree, React } from "@Api";
import { getNestedProp, concateClassNames } from "@Utils";
import ErrorBoundary from "@Components/ErrorBoundary";
import ErrorIcon from "@Components/icons/ErrorIcon";
// import ProfileTypeEnum from "@Enums/ProfileTypeEnum";
import Logger from "@Utils/Logger";

import { Filters, getModule } from "@Webpack";
import ViewProfilePictureButtonComponent from "../components/ViewProfilePictureButtonComponent";

// const UserBannerMask = getModuleAndKey(Filters.byStrings("bannerSrc", "showPremiumBadgeUpsell"), { searchExports: true });
const UserProfileModalforwardRef = getModule(Filters.byKeys("Overlay", "render"));
const typeFilter = Filters.byStrings("div", "children:");

import Plugin, { Events } from "@Utils/Plugin";

Plugin.on(Events.START, () => {
	if (!UserProfileModalforwardRef) return Logger.patchError("patchVPPButton");
	const unpatch = Patcher.after(UserProfileModalforwardRef, "render", (_, [props], ret) => {
		const t = getNestedProp(ret, "props.children.props.children.props.children.props.children.1")
		const target = typeFilter(t?.type) && t || findInTree(ret, a => a?.type === "header" || a?.props?.className?.includes("profileHeader"), { walkable: ["props", "children"] });
		if (!target) return;

		ret.props.className = `${ret.props.className} VPP-container`;

		const children = Array.isArray(target.props.children) ? target.props.children : [target.props.children];
				

		children.unshift(
			<ErrorBoundary
				id="ViewProfilePictureButtonComponent"
				plugin={config.info.name}
				fallback={<ErrorIcon className="VPP-Button" />}>
				<ViewProfilePictureButtonComponent
					className={concateClassNames("VPP-Button", !typeFilter(target?.type) && "VPP-float")}
					user={props.user}
					displayProfile={props.displayProfile}
				/>
			</ErrorBoundary>
		);
		target.props.children = children;
	});

	Plugin.once(Events.STOP, unpatch);
});
