import { React } from "@Api";

export default function Gap({ direction, gap }) {
	const style = {
		VERTICAL: {
			width: gap,
			height: "100%"
		},
		HORIZONTAL: {
			height: gap,
			width: "100%"
		}
	}[direction];
	return <div style={style} />;
}

Gap.direction = {
	HORIZONTAL:"HORIZONTAL", 
	VERTICAL:"VERTICAL", 
}