import { React } from "@Api";
import ModalCarousel from "@Modules/ModalCarousel";
import ModalRoot from "@Modules/ModalRoot";

export default ({ props, items }) => {
	return (
		<ModalRoot
			{...props}
			className="VPP-carousel carouselModal-1eUFoq zoomedCarouselModalRoot-beLNhM">
			<ModalCarousel
				startWith={0}
				className="modalCarouselWrapper-YK1MX4"
				items={items.map(item => ({ "component": item }))}
			/>
		</ModalRoot>
	);
};
