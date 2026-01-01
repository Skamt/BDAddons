import React from "@React";
import Divider from "@Components/Divider";
import Heading from "@Modules/Heading";
import Blacklist from "@/blacklist";

export default function PingToggle({userId}) {
	const [has, setHas] = React.useState(Blacklist.has(userId));
	
	const toggleHandler = e =>{
		Blacklist.toggle(userId)
		setHas(!has);
	}

	return (
		<>
			<Heading
				style={{
					padding: "8px 12px"
				}}
				onClick={toggleHandler}
				variant="text-sm/bold"
				color={has ? "text-link" : "text-muted"}>
				Always OFF ?
			</Heading>
			<Divider
				gap={0}
				gutter={4}
				direction={Divider.direction.VERTICAL}
			/>
		</>
	);
}
