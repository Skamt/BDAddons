import config from "@Config";
import { Patcher, findInTree, React } from "@Api";
import { concateClassNames } from "@Utils";
import ErrorBoundary from "@Components/ErrorBoundary";
import ErrorIcon from "@Components/icons/ErrorIcon";
// import ProfileTypeEnum from "@Enums/ProfileTypeEnum";
import Logger from "@Utils/Logger";

import { Filters, getModule } from "@Webpack";
import ViewProfilePictureButtonComponent from "../components/ViewProfilePictureButtonComponent";

// const UserBannerMask = getModuleAndKey(Filters.byStrings("bannerSrc", "showPremiumBadgeUpsell"), { searchExports: true });
const UserProfileModalforwardRef = getModule(Filters.byKeys("Overlay", "render"));
const typeFilter = Filters.byStrings("div", "wrapper", "children");

import Plugin, { Events } from "@Utils/Plugin";

Plugin.on(Events.START, () => {
	if (!UserProfileModalforwardRef) return Logger.patchError("patchVPPButton");
	const unpatch = Patcher.after(UserProfileModalforwardRef, "render", (_, [props], ret) => {
		const target = findInTree(ret, a => typeFilter(a?.type), { walkable: ["props", "children"] }) || findInTree(ret, a => a?.type === "header" || a?.props?.className?.startsWith("profileHeader"), { walkable: ["props", "children"] });
		if (!target) return;

		ret.props.className = `${ret.props.className} VPP-container`;
		target.props.children.unshift(
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
	});

	Plugin.once(Events.STOP, unpatch);
});
