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

function getButtonClasses({ user, profileType }, isNotNitro, banner) {
	let res = "VPP-Button";
	if (profileType === ProfileTypeEnum.MODAL) res += " VPP-profile";

	if (isSelf(user)) res += " VPP-self";
	else {
		if (banner && isNotNitro) res += " VPP-left";
		else res += " VPP-right";
	}
	return res;
}

export default class ViewProfilePicture {
	clickHandler({ user, displayProfile }, { backgroundColor, backgroundImage }) {
		const avatarURL = user.getAvatarURL(displayProfile.guildId, 4096, true);
		const AvatarImageComponent = getImageModalComponent(avatarURL);
		const BannerImageComponent = backgroundImage ? getImageModalComponent(backgroundImage, { width: window.innerWidth * 0.8 }) : <ColorModalComponent color={backgroundColor} />;

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

		Patcher.after(module, key, (_, [props], el) => {
			if (props.profileType === ProfileTypeEnum.SETTINGS) return;

			const bannerElement = el.props.children.props;

			bannerElement.className += " VPP-container";
			const bannerObject = bannerElement.style;
			const children = bannerElement.children;

			const buttonClasses = getButtonClasses(props, children[0], bannerObject?.backgroundImage);

			children.push(
				<ErrorBoundary
					id="ViewProfilePictureButtonComponent"
					plugin={config.info.name}
					fallback={<ErrorIcon className={buttonClasses} />}>
					<ViewProfilePictureButtonComponent
						className={buttonClasses}
						isHovering={props.isHovering}
						onClick={() => this.clickHandler(props, bannerObject)}
					/>
				</ErrorBoundary>
			);
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
