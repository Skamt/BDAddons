import React from "@React";
import Settings from "@Utils/Settings";
import { openModal } from "@Utils/Modals";
import Tooltip from "@Components/Tooltip";
import ImageIcon from "@Components/icons/ImageIcon";
import { getImageDimensions, promiseHandler } from "@Utils";
import { getImageComponent } from "@Utils/ImageModal";
import ColorModalComponent from "./ColorModalComponent";
import ModalCarousel from "./ModalCarousel";
import Spinner from "@Modules/Spinner";

function fit({ width, height }) {
	const ratio = Math.min(innerWidth / width, innerHeight / height);
	width = Math.round(width * ratio);
	height = Math.round(height * ratio);
	return {
		width,
		height,
		maxHeight: height * 0.8,
		maxWidth: width * 0.8
	};
}

function Banner({ url, src }) {
	const [loaded, setLoaded] = React.useState(false);
	const dimsRef = React.useRef();

	React.useEffect(() => {
		(async () => {
			const [err, dims] = await promiseHandler(getImageDimensions(src));
			dimsRef.current = fit(err ? {} : dims);
			setLoaded(true);
		})();
	}, []);

	if (!loaded) return <Spinner type={Spinner.Type.SPINNING_CIRCLE} />;
	return getImageComponent(url, dimsRef.current);
}

export default ({ bannerObject, className, user, displayProfile }) => {
	const showOnHover = Settings(Settings.selectors.showOnHover);
	if (showOnHover) className += " VPP-hover";

	const { backgroundColor } = bannerObject || {};
	const handler = () => {
		const avatarURL = user.getAvatarURL(displayProfile.guildId, 4096, true);
		const bannerURL = displayProfile.getBannerURL({ canAnimate: true, size: 4096 });
		const color = backgroundColor || displayProfile.accentColor || displayProfile.primaryColor;
		const items = [
			getImageComponent(avatarURL, { ...fit({ width: 4096, height: 4096 }) }),
			bannerURL && (
				<Banner
					url={bannerURL}
					src={displayProfile.getBannerURL({ canAnimate: true, size: 20 })}
				/>
			),
			(!bannerURL || Settings.getState().bannerColor) &&
				(color ? (
					<ColorModalComponent.SimpleColorModal color={color} />
				) : (
					<ColorModalComponent.ColorModal
						user={user}
						displayProfile={displayProfile}
					/>
				))
		]
			.filter(Boolean)
			.map(item => ({ component: item }));

		openModal(
			<ModalCarousel
				startWith={0}
				className="VPP-carousel"
				items={items}
			/>,
			"VPP-carousel",
			"VPP-carousel-modal"
		);
	};

	return (
		<Tooltip note="View profile picture">
			<div
				style={{
					position: backgroundColor ? "absolute" : "static"
				}}
				role="button"
				onClick={handler}
				className={className}>
				<ImageIcon />
			</div>
		</Tooltip>
	);
};
