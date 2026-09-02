import TextInput from "@Components/TextInput";
import React from "@React";
import { nop } from "@Utils";
import Settings from "@Utils/Settings";
import Divider from "@Components/Divider";
import Heading from "@Modules/Heading";

export default function SettingTextInput({
	settingKey,
	processValue = (a) => a,
	border,
	label,
	onChange = nop,
	...rest
}) {
	const [val, set] = React.useState(Settings.state[settingKey]);
	return (
		<>
			{label && (
				<Heading tag="legend" variant="text-md/medium">
					{label}
				</Heading>
			)}
			<TextInput
				{...rest}
				onChange={(e) => {
					set(e)
					Settings[`set${settingKey}`](processValue(e));
					onChange?.(e);
				}}
				value={val}
			/>
			{border && <Divider gap={15} />}
		</>
	);
}
