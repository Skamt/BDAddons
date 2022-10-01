module.exports = ({ props, items }) => {
	return (
		<ModalRoot
			{...props}
			className="viewProfilePicture carouselModal-1eUFoq zoomedCarouselModalRoot-beLNhM">
			<ModalCarousel
				startWith={0}
				className="modalCarouselWrapper-YK1MX4"
				items={items.map(item => ({ "component": item }))}
			/>
		</ModalRoot>
	);
};
