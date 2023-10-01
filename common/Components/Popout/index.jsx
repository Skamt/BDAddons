import { React } from "@Api";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";

const { Popout } = TheBigBoyBundle;

export default ({ spacing, position, animation, renderPopout, children }) => {
	const [show, setShow] = React.useState(false);

	return (
		<div
			className={`${config.info.name}-popout-container`}
			onMouseLeave={() => setShow(false)}
			onMouseEnter={() => setShow(true)}>
			<Popout
				renderPopout={renderPopout}
				shouldShow={show}
				position={position ?? "top"}
				animation={animation ?? "1"}
				spacing={spacing ?? 8}>
				{props => children}
			</Popout>
		</div>
	);
};
