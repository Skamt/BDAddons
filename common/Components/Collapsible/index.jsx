import { React } from "@Api";
import "./styles";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import ArrowIcon from "@Components/icons/ArrowIcon";
import Flex from "@Components/Flex";
const { Heading } = TheBigBoyBundle;

export default function Collapsible({ title, children }) {
	const [open, setOpen] = React.useState(false);

	return (
		<Flex
			className={open ? "collapsible-container collapsible-open" : "collapsible-container"}
			direction={Flex.Direction.VERTICAL}>
			<Flex
				
				className="collapsible-header"
				onClick={() => setOpen(!open)}
				direction={Flex.Direction.HORIZONTAL}
				align={Flex.Align.CENTER}>
				<Flex grow={0} className="collapsible-icon">
					<ArrowIcon />
				</Flex>
				<Heading
					className="collapsible-title"
					tag="h5">
					{title}
				</Heading>
			</Flex>
			{open && <div className="collapsible-body">{children}</div>}
		</Flex>
	);
}
