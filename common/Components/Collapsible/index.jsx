import "./styles";
import { React } from "@Api";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import ArrowIcon from "@Components/icons/ArrowIcon";

const { Heading } = TheBigBoyBundle;

export default function Collapsible({ title, children }) {
	const [open, setOpen] = React.useState(false);

	return (
		<div className={open ? "collapsible-container collapsible-open" : "collapsible-container"}>
			<div
				className="collapsible-header"
				onClick={() => setOpen(!open)}>
				<div className="collapsible-icon">
					<ArrowIcon />
				</div>
				<Heading
					className="collapsible-title"
					tag="h5">
					{title}
				</Heading>
			</div>
			<div className="collapsible-body">{children}</div>
		</div>
	);
}

