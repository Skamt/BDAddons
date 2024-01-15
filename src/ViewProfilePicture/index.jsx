import css from "./styles";
import { Data, DOM, React, Patcher } from "@Api";
import Settings from "@Utils/Settings";

import { isSelf } from "@Utils/User";
import { getImageModalComponent, openModal, getImageDimensions } from "@Utils";
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

function stretchToFit({width, height}) {
	const ratio = Math.min(innerWidth  / width, innerHeight  / height);

	return { 
		width: Math.round(width * ratio), 
		height: Math.round(height * ratio) 
	};
}

async function getBannerDimenions(src) {
	src = src.replace("url(", "").replace(")");
	try {
		const dims = await getImageDimensions(src);
		return stretchToFit(dims, dims);
	} catch {
		return {};
	}
}

export default class ViewProfilePicture {
	async clickHandler({ user, displayProfile }, { backgroundColor, backgroundImage }) {
		const avatarURL = user.getAvatarURL(displayProfile.guildId, 4096, true);
		const bannerURL = backgroundImage && displayProfile.getBannerURL({ canAnimate: true, size: 4096 });

		const items = [
			getImageModalComponent(avatarURL, { width: 4096, height: 4096 }), 
			bannerURL && getImageModalComponent(bannerURL, await getBannerDimenions(backgroundImage)), 
			(!bannerURL || Settings.get("bannerColor")) && <ColorModalComponent color={backgroundColor} />
		].filter(Boolean).map(item => ({ "component": item, ...item.props }));

		openModal(
			<ModalCarousel
				startWith={0}
				className="VPP-carousel"
				items={items}
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
