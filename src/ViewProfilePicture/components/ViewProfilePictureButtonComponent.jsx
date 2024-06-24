import { React } from "@Api";
import Settings from "@Utils/Settings";
import Tooltip from "@Components/Tooltip";
import ImageIcon from "@Components/icons/ImageIcon";
import { getImageDimensions, getImageModalComponent, promiseHandler, openModal } from "@Utils";
import ColorModalComponent from "./ColorModalComponent";
import ModalCarousel from "./ModalCarousel";

import TheBigBoyBundle from "@Modules/TheBigBoyBundle";

const { Spinner } = TheBigBoyBundle;

function fit({ width, height }) {
	const ratio = Math.min(innerWidth / width, innerHeight / height);

	return {
		width: Math.round(width * ratio),
		height: Math.round(height * ratio)
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
	return getImageModalComponent(url, dimsRef.current);
}

export default ({ className, user, displayProfile }) => {
	const showOnHover = Settings(Settings.selectors.showOnHover);
	if (showOnHover) className += " VPP-hover";

	const handler = () => {
		
		const avatarURL = user.getAvatarURL(displayProfile.guildId, 4096, true);
		const bannerURL = displayProfile.getBannerURL({ canAnimate: true, size: 4096 });

		const items = [
			getImageModalComponent(avatarURL, { width: 4096, height: 4096 }),
			bannerURL && (
				<Banner
					url={bannerURL}
					src={displayProfile.getBannerURL({ canAnimate: true, size: 20 })}
				/>
			),
			(!bannerURL || Settings.getState().bannerColor) && displayProfile.accentColor && <ColorModalComponent color={displayProfile.accentColor} />
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
				role="button"
				onClick={handler}
				className={className}>
				<ImageIcon height="18" width="18"/>
			</div>
		</Tooltip>
	);
};
