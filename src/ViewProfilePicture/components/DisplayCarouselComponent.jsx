import { React } from "@Api";
import ModalCarousel from "@Modules/ModalCarousel";

export default ({ items }) => {
	return (
		<ModalCarousel
			startWith={0}
			className="modalCarouselWrapper-YK1MX4"
			items={items.map(item => ({ "component": item }))}
		/>
	);
};
