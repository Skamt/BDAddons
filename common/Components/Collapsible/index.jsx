import { React } from "@Api";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import Arrow from "@Components/Icons/Arrow";
import Flex from "@Components/Flex";
const { Heading } = TheBigBoyBundle;

export default function Collapsible({ title, children }) {
	const [open, setOpen] = React.useState(false);

	return (
		<Flex
			style={{
				borderRadius: 5,
				border: "1px solid rgb(30, 31, 34)",
				gap: 20
			}}
			direction={Flex.Direction.VERTICAL}>
			<Flex
				onClick={() => setOpen(!open)}
				style={{
					borderBottom: open && "1px solid rgb(30, 31, 34)",
					background: "rgba(30, 31, 34, 0.3)",
					padding: "10px 3px",
					gap: 8
				}}
				direction={Flex.Direction.HORIZONTAL}
				align={Flex.Align.CENTER}>
				<Flex
					style={{
						flexGrow: 0,
						transition: "rotate 150ms linear",
						rotate: open ? "90deg" : "0deg"
					}}>
					<Arrow />
				</Flex>
				<Heading
					style={{
						textTransform: "capitalize"
					}}
					tag="h5">
					{title}
				</Heading>
			</Flex>
			{open && (
				<div
					style={{
						margin: "0 10px"
					}}>
					{children}
				</div>
			)}
		</Flex>
	);
}
