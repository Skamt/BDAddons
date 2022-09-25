module.exports = ({ p, data }) => {
	const items = data.map(({ url, width, height }) => ({
		"component": (
			<ImageModal
				src={url}
				width={width}
				height={height}
				original={url}
				renderLinkComponent={renderMaskedLinkComponent}
			/>
		),
		"width": width,
		"height": height,
		"src": url
	}));
	return (
		<>
			<style>{`
				.modalCarouselWrapper-YK1MX4 {
					position: static; 
				} 
				.carouselModal-1eUFoq:not(#idontthinkso) {
					height: auto; 
					width: auto; 
					box-shadow: none; 
					position: static; 
					transform: none !important; 
				} 
				.arrowContainer-2wpC4q {
					margin: 0 15px; 
					opacity: 0.8; 
					background: var(--background-primary); 
					border-radius: 50%; 
				}`}</style>
			<ModalRoot
				{...p}
				className="carouselModal-1eUFoq zoomedCarouselModalRoot-beLNhM">
				<ModalCarousel
					className="modalCarouselWrapper-YK1MX4"
					items={items}></ModalCarousel>
			</ModalRoot>
		</>
	);
};
