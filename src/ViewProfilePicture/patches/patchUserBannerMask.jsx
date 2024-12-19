import { Patcher, React } from "@Api";
import ErrorBoundary from "@Components/ErrorBoundary";
import ErrorIcon from "@Components/icons/ErrorIcon";
import ProfileTypeEnum from "@Enums/ProfileTypeEnum";
import Logger from "@Utils/Logger";

import { Filters, getModuleAndKey } from "@Webpack";
import ViewProfilePictureButtonComponent from "../components/ViewProfilePictureButtonComponent";

const UserBannerMask = getModuleAndKey(Filters.byStrings("bannerSrc", "showPremiumBadgeUpsell"), { searchExports: true });

function getButtonClasses({  profileType }, isNotNitro, banner) {
	let className = "VPP-Button";

	if (profileType === ProfileTypeEnum.MODAL) className += " VPP-profile";

	if (banner && isNotNitro) className += " VPP-left";
	else className += " VPP-right";

	return className;
}

export default () => {
	if (!UserBannerMask) return Logger.patchError("UserBannerMask");

	const { module, key } = UserBannerMask;

	Patcher.after(module, key, (_, [props], el) => {
		if (props.profileType === ProfileTypeEnum.SETTINGS) return;

		const bannerElement = el.props.children.props;

		bannerElement.className += " VPP-container";
		const bannerObject = bannerElement.style;
		const children = bannerElement.children;

		const className = getButtonClasses(props, children[0], bannerObject?.backgroundImage);

		children.push(
			<ErrorBoundary
				id="ViewProfilePictureButtonComponent"
				plugin={config.info.name}
				fallback={<ErrorIcon className={className} />}>
				<ViewProfilePictureButtonComponent
					className={className}
					isHovering={props.isHovering}
					user={props.user}
					displayProfile={props.displayProfile}
					bannerObject={bannerObject}
				/>
			</ErrorBoundary>
		);
	});
};
