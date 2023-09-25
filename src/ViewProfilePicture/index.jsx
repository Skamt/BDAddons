import css from "./styles";
import { getInternalInstance, findInTree, Data, DOM, React, Patcher } from "@Api";
import Settings from "@Utils/Settings";
import { getNestedProp } from "@Utils";
import { isSelf } from "@Utils/User";
import Logger from "@Utils/Logger";
import ErrorBoundary from "@Components/ErrorBoundary";
import ErrorIcon from "@Components/ErrorIcon";
import ProfileTypeEnum from "@Enums/ProfileTypeEnum";
import UserBannerMask from "@Patch/UserBannerMask";
import SelectedGuildStore from "@Stores/SelectedGuildStore";
import ImageModal from "@Modules/ImageModal";
import RenderLinkComponent from "@Modules/RenderLinkComponent";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import ColorModalComponent from "./components/ColorModalComponent";
import DisplayCarouselComponent from "./components/DisplayCarouselComponent";
import ViewProfilePictureButtonComponent from "./components/ViewProfilePictureButtonComponent";
import SettingComponent from "./components/SettingComponent";
import ModalRoot from "@Modules/ModalRoot";

const getImageModalComponent = (url, rest) => (
	<ImageModal
		{...rest}
		src={url}
		original={url}
		renderLinkComponent={p => <RenderLinkComponent {...p} />}
	/>
);

const IMG_WIDTH = 4096;

function openCarousel(items) {
	TheBigBoyBundle.openModal(props => (
		<ErrorBoundary
			id="DisplayCarouselComponent"
			plugin={config.info.name}>
			<ModalRoot
				{...props}
				className="VPP-carousel carouselModal-1eUFoq zoomedCarouselModalRoot-beLNhM">
				<DisplayCarouselComponent items={items} />
			</ModalRoot>
		</ErrorBoundary>
	));
}

function closeModal() {
	const target = document.querySelector(".VPP-container");
	if (!target) return;
	const instance = getInternalInstance(target);
	if (!instance) return;
	const closeObj = findInTree(instance, a => a?.onClose, { walkable: ["return", "pendingProps"] });
	closeObj && closeObj.onClose && typeof closeObj.onClose === "function" && closeObj.onClose();
}

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
	constructor() {
		Settings.init(config.settings);
	}

	clickHandler(user, bannerObject, isUserPopout) {
		const { backgroundColor, backgroundImage } = bannerObject;
		const guildId = isUserPopout ? SelectedGuildStore.getGuildId() : "";
		const avatarURL = user.getAvatarURL(guildId, IMG_WIDTH, true);
		const AvatarImageComponent = getImageModalComponent(avatarURL, { width: IMG_WIDTH, height: IMG_WIDTH });
		const BannerImageComponent = backgroundImage ? getImageModalComponent(`${backgroundImage.match(/(?<=url\()(.+?)(?=\?|\))/)?.[0]}?size=${IMG_WIDTH}`, { width: IMG_WIDTH }) : <ColorModalComponent color={backgroundColor} />;
		closeModal();
		openCarousel([AvatarImageComponent, BannerImageComponent]);
	}

	patchUserBannerMask() {
		if (!UserBannerMask) return Logger.patch("patchUserBannerMask");

		const { module, key } = UserBannerMask;

		Patcher.after(module, key, (_, [{ user, profileType }], returnValue) => {
			if (profileType === ProfileTypeEnum.SETTINGS) return;

			returnValue.props.className += " VPP-container";

			const bannerObject = getNestedProp(returnValue, "props.children.1.props.children.props.style");
			const children = getNestedProp(returnValue, "props.children.1.props.children.props.children");

			const buttonClasses = getButtonClasses(user, profileType, bannerObject?.backgroundImage);

			if (Array.isArray(children) && bannerObject) {
				children.push(
					<ErrorBoundary
						id="ViewProfilePictureButtonComponent"
						plugin={config.info.name}
						fallback={<ErrorIcon className={buttonClasses} />}>
						<ViewProfilePictureButtonComponent
							className={buttonClasses}
							onClick={() => this.clickHandler(user, bannerObject, ProfileTypeEnum.POPOUT === profileType)}
						/>
					</ErrorBoundary>
				);
			}
		});
	}

	start() {
		try {
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
