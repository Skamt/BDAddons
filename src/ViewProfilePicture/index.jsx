import config from "@config";

import css from "./styles";
import shouldChangelog from "@Utils/Changelog";

import { Data, DOM, React, Patcher } from "@Api";
import { getNestedProp, isSelf } from "@Utils";
import Logger from "@Utils/Logger";

import ProfileTypeEnum from "@Enums/ProfileTypeEnum";

import UserBannerMask from "@Patch/UserBannerMask";

import SelectedGuildStore from "@Stores/SelectedGuildStore";

import ImageModal from "@Modules/ImageModal";
import RenderLinkComponent from "@Modules/RenderLinkComponent";
import Color from "@Modules/Color";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";

import ColorModalComponent from "./components/ColorModalComponent";
import DisplayCarouselComponent from "./components/DisplayCarouselComponent";
import ErrorBoundary from "./components/ErrorBoundary";
import ErrorComponent from "./components/ErrorComponent";
import ViewProfilePictureButtonComponent from "./components/ViewProfilePictureButtonComponent";
import SettingComponent from "./components/SettingComponent";

const getImageModalComponent = (Url, props) => (
	<ImageModal
		{...props}
		src={Url}
		original={Url}
		renderLinkComponent={p => <RenderLinkComponent {...p} />}
	/>
);

const IMG_WIDTH = 4096;

function openCarousel(items) {
	TheBigBoyBundle.openModal(props => (
		<ErrorBoundary
			id="DisplayCarouselComponent"
			plugin={config.info.name}
			closeModal={props.onClose}>
			<DisplayCarouselComponent
				props={props}
				items={items}
			/>
		</ErrorBoundary>
	));
}

function getButtonClasses(user, profileType, banner, showOnHover) {
	let res = "VPP-Button";
	if (profileType === ProfileTypeEnum.MODAL) res += " VPP-profile";
	if (isSelf(user)) res += " VPP-self";
	else {
		if (banner) res += " VPP-left";
		else res += " VPP-right";
	}
	if(showOnHover) res += " VPP-hover";
	return res;
}

export default class ViewProfilePicture {
	constructor() {
		this.settings = Data.load("settings") || { showOnHover: false };
	}

	clickHandler(user, bannerObject, isUserPopout) {
		const { backgroundColor, backgroundImage } = bannerObject;
		const guildId = isUserPopout ? SelectedGuildStore.getGuildId() : "";
		const avatarURL = user.getAvatarURL(guildId, IMG_WIDTH, true);
		const AvatarImageComponent = getImageModalComponent(avatarURL, { width: IMG_WIDTH, height: IMG_WIDTH });
		const BannerImageComponent = backgroundImage ? getImageModalComponent(`${backgroundImage.match(/(?<=\().*(?=\?)/)?.[0]}?size=${IMG_WIDTH}`, { width: IMG_WIDTH }) : <ColorModalComponent color={Color ? Color(backgroundColor).hex() : backgroundColor} />;
		openCarousel([AvatarImageComponent, BannerImageComponent]);
	}

	patchUserBannerMask() {
		const { module, key } = UserBannerMask;
		if (module && key)
			Patcher.after(module, key, (_, [{ user, profileType }], returnValue) => {
				if (profileType === ProfileTypeEnum.SETTINGS) return;
				
				returnValue.props.className += " VPP-container";

				const bannerObject = getNestedProp(returnValue, "props.children.1.props.children.props.style");
				const children = getNestedProp(returnValue, "props.children.1.props.children.props.children");

				const buttonClasses = getButtonClasses(user, profileType, bannerObject?.backgroundImage, this.settings.showOnHover);

				if (Array.isArray(children) && bannerObject) {
					children.push(
						<ErrorBoundary
							id="ViewProfilePictureButtonComponent"
							plugin={config.info.name}
							fallback={<ErrorComponent className={buttonClasses} />}>
							<ViewProfilePictureButtonComponent
								className={buttonClasses}
								onClick={() => this.clickHandler(user, bannerObject, ProfileTypeEnum.POPOUT === profileType)}
							/>
						</ErrorBoundary>
					);
				}
			});
		else Logger.patch("patchUserBannerMask");
	}

	start() {
		try {
			DOM.addStyle(css);
			shouldChangelog()?.();
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
		return (
			<SettingComponent
				description="Show on hover"
				note="By default hide ViewProfilePicture button and show on hover."
				value={this.settings.showOnHover}
				onChange={e => {
					this.settings.showOnHover = e;
					Data.save("settings", this.settings);
				}}
			/>
		);
	}
}
