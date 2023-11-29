import css from "./styles";
import { Data, DOM, React, Patcher } from "@Api";
import Settings from "@Utils/Settings";

import { isSelf } from "@Utils/User";
import { getImageModalComponent, openModal } from "@Utils";
import Logger from "@Utils/Logger";
import ErrorBoundary from "@Components/ErrorBoundary";
import ErrorIcon from "@Components/ErrorIcon";
import ProfileTypeEnum from "@Enums/ProfileTypeEnum";
import UserBannerMask from "@Patch/UserBannerMask";
import SelectedGuildStore from "@Stores/SelectedGuildStore";
import ImageModalVideoModal from "@Modules/ImageModalVideoModal";
import RenderLinkComponent from "@Modules/RenderLinkComponent";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import ColorModalComponent from "./components/ColorModalComponent";
import ViewProfilePictureButtonComponent from "./components/ViewProfilePictureButtonComponent";
import SettingComponent from "./components/SettingComponent";
import ModalCarousel from "@Modules/ModalCarousel";

function getButtonClasses(user, profileType, banner) {
	let res = "VPP-Button";
	if (profileType === ProfileTypeEnum.MODAL) res += " VPP-profile";
	if (isSelf(user)) res += " VPP-self";
	else {
		if (banner) res += " VPP-left";
		else res += " VPP-right";
	}
	return res;
}

export default class ViewProfilePicture {
	clickHandler({ user, displayProfile }) {
		const avatarURL = user.getAvatarURL(displayProfile.guildId, 4096, true);
		const bannerURL = displayProfile.getBannerURL({});
		const AvatarImageComponent = getImageModalComponent(avatarURL);
		const BannerImageComponent = bannerURL ? getImageModalComponent(bannerURL, { width: innerWidth * .8 }) : <ColorModalComponent color={displayProfile.accentColor} />;
		openModal(
			<ModalCarousel
				startWith={0}
				className="VPP-carousel"
				items={[AvatarImageComponent, BannerImageComponent].map(item => ({ "component": item }))}
			/>
		);
	}

	patchUserBannerMask() {
		if (!UserBannerMask) return Logger.patch("UserBannerMask");

		const { module, key } = UserBannerMask;

		Patcher.after(module, key, (_, [props], returnValue) => {
			const { user, isHovering, profileType } = props;

			if (profileType === ProfileTypeEnum.SETTINGS) return;

			const bannerElement = returnValue.props.children.props;

			bannerElement.className += " VPP-container";

			const bannerObject = bannerElement.style;
			const children = bannerElement.children;

			const buttonClasses = getButtonClasses(user, profileType, bannerObject?.backgroundImage);

			if (Array.isArray(children) && bannerObject) {
				children.push(
					<ErrorBoundary
						id="ViewProfilePictureButtonComponent"
						plugin={config.info.name}
						fallback={<ErrorIcon className={buttonClasses} />}>
						<ViewProfilePictureButtonComponent
							className={buttonClasses}
							isHovering={isHovering}
							onClick={() => this.clickHandler(props)}
						/>
					</ErrorBoundary>
				);
			}
		});
	}

	start() {
		try {
			Settings.init(config.settings);
			DOM.addStyle(css);
			this.patchUserBannerMask();
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
	}

	getSettingsPanel() {
		return <SettingComponent />;
	}
}
