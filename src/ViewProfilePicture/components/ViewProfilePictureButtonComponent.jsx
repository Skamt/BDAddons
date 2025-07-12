import React from "@React";
import Settings from "@Utils/Settings";
import { openModal } from "@Utils/Modals";
import Tooltip from "@Components/Tooltip";
import ImageIcon from "@Components/icons/ImageIcon";
import { concateClassNames, fit, getImageDimensions, promiseHandler } from "@Utils";
import { ImageComponent } from "@Utils/ImageModal";
import ColorModalComponent from "./ColorModalComponent";
import ModalCarousel from "./ModalCarousel";
import Spinner from "@Modules/Spinner";

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
	return (
		<ImageComponent
			url={url}
			{...dimsRef.current}
		/>
	);
}

export default ({ className, user, displayProfile }) => {
	const showOnHover = Settings(Settings.selectors.showOnHover);

	const handler = () => {
		const avatarURL = user.getAvatarURL(displayProfile.guildId, 4096, true);
		const bannerURL = displayProfile.getBannerURL({ canAnimate: true, size: 4096 });
		const color = displayProfile.accentColor || displayProfile.primaryColor;
		const items = [
			<ImageComponent
				url={avatarURL}
				{...fit({ width: 4096, height: 4096 })}
			/>,
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
			{ className: "VPP-carousel-modal" }
		);
	};

	return (
		<Tooltip note="View profile picture">
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
			<div
				onClick={handler}
				className={concateClassNames(className, showOnHover && "VPP-hover")}>
				<ImageIcon />
			</div>
		</Tooltip>
	);
};
