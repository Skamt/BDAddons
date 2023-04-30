import { React } from "@Api";
import Switch from "@Components/Switch";

export default props => {
	const [enabled, setEnabled] = React.useState(props.value);
	return (
		<Switch
			value={enabled}
			hideBorder={true}
			onChange={e => {
				props.onChange(e);
				setEnabled(e);
			}}>
			{props.description}
		</Switch>
	);
};