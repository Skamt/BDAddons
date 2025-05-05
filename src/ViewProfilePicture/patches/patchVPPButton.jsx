import { Patcher, findInTree, React } from "@Api";
import ErrorBoundary from "@Components/ErrorBoundary";
import ErrorIcon from "@Components/icons/ErrorIcon";
// import ProfileTypeEnum from "@Enums/ProfileTypeEnum";
import Logger from "@Utils/Logger";

import { Filters, getModule } from "@Webpack";
import ViewProfilePictureButtonComponent from "../components/ViewProfilePictureButtonComponent";

// const UserBannerMask = getModuleAndKey(Filters.byStrings("bannerSrc", "showPremiumBadgeUpsell"), { searchExports: true });
const UserProfileModalforwardRef = getModule(Filters.byKeys("Overlay","render"));
const typeFilter = Filters.byStrings("div","wrapper", "children");

export default () => {
	if (!UserProfileModalforwardRef) return Logger.patchError("patchVPPButton");

	Patcher.after(UserProfileModalforwardRef, "render", (_, [props], ret) => {
		const buttonsWrapper = findInTree(ret, a => typeFilter(a?.type), { walkable: ["props", "children"] });
		if (!buttonsWrapper) return;
		ret.props.className = `${ret.props.className} VPP-container`;
		buttonsWrapper.props.children = [
			// eslint-disable-next-line react/jsx-key
			<ErrorBoundary
				id="ViewProfilePictureButtonComponent"
				plugin={config.info.name}
				fallback={<ErrorIcon className="VPP-Button" />}>
				<ViewProfilePictureButtonComponent
					className="VPP-Button"
					user={props.user}
					displayProfile={props.displayProfile}
				/>
			</ErrorBoundary>,
			buttonsWrapper.props.children
		];
	});
};
