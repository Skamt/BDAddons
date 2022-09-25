module.exports = ({ p, data }) => {
	const items = data.map(({url,width,height}) => ({
		"component":<ImageModal
					src={url}
					width={width}
					height={height}
					original={url}
					renderLinkComponent={renderMaskedLinkComponent}
				/>,
		"width":width,
		"height":height,
		"src":url
	}))
	return (
		<ModalRoot
			{...p}
			className="carouselModal-1eUFoq zoomedCarouselModalRoot-beLNhM">
			<ModalCarousel 
				className="modalCarouselWrapper-YK1MX4"
				items={items}
			></ModalCarousel>
		</ModalRoot>
	);
};
