import TextInput from "@Components/TextInput";
import React from "@React";
import Settings from "@Settings";
import Divider from "@Components/Divider";
import Heading from "@Modules/Heading";

export default function SettingTextInput({ setting, processValue = a => a, border, label, ...rest }) {
	const val = Settings(setting.get);
	return (
		<>
			{label && (
				<Heading
					tag="legend"
					variant="text-md/medium">
					{label}
				</Heading>
			)}
			<TextInput
				{...rest}
				onChange={e => setting.set(processValue(e))}
				value={val}
			/>
			{border && <Divider />}
		</>
	);
}
