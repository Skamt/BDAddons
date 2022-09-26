module.exports = ({ props, data }) => {
	const items = data.map(({ width, height, src, color }) => {
			return {
				"component": 
					src ?
					<ImageModal
						src={src}
						original={src}
						placeholder={src}
						width={width}
						height={height}
						renderLinkComponent={renderMaskedLinkComponent}
					/>
					:
					<div className={"noBanner"} style={{backgroundColor:color}}></div>
			};
	});
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
				{...props}
				className="carouselModal-1eUFoq zoomedCarouselModalRoot-beLNhM">
				<ModalCarousel
					className="modalCarouselWrapper-YK1MX4"
					items={items}></ModalCarousel>
			</ModalRoot>
		</>
	);
};
