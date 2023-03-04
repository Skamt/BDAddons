module.exports = ({ props, items }) => {
	return (
		<Modules.ModalRoot
			{...props}
			className="VPP-carousel carouselModal-1eUFoq zoomedCarouselModalRoot-beLNhM">
			<Modules.ModalCarousel
				startWith={0}
				className="modalCarouselWrapper-YK1MX4"
				items={items.map(item => ({ "component": item }))}
			/>
		</Modules.ModalRoot>
	);
};
