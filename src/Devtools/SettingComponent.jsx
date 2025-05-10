import React from "@React";
import Switch from "@Components/Switch";

export default function ({ settings, enableExp }) {
	const [enabled, setEnabled] = React.useState(settings.expEnabled);

	return (
		<Switch
			value={enabled}
			hideBorder={false}
			onChange={e => {
				settings.expEnabled = e;
				setEnabled(e);
				enableExp(e);
			}}>
			enableExperiments
		</Switch>
	);
}
