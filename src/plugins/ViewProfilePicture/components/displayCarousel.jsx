module.exports = ({ props, imagesArr, bannerColorCopyHandler }) => {
	const items = imagesArr.map(({ width, height, src, color }) => ({
		"component": src ? <ImageModal
				src={src}
				original={src}
				placeholder={src}
				width={width}
				height={height}
				renderLinkComponent={renderMaskedLinkComponent}
			/> : <div
				className={"noBanner wrapper-2bCXfR"}
				style={{ backgroundColor: color }}>
				<a
					className={`${classes.downloadLink} ${classes.anchorUnderlineOnHover}`}
					onClick={_ => bannerColorCopyHandler(color)}>
					Copy Color
				</a>
			</div>
		}));
	return <ModalRoot
		{...props}
		className="viewProfilePicture carouselModal-1eUFoq zoomedCarouselModalRoot-beLNhM">
		<ModalCarousel
			className="modalCarouselWrapper-YK1MX4"
			items={items}>
		</ModalCarousel>
	</ModalRoot>
}