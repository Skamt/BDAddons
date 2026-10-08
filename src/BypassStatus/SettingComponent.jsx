import config from "@Config";
import React from "@React";
import SettingSwtich from "@Components/SettingSwtich";
import SettingTextInput from "@Components/SettingTextInput";
import Settings from "@Settings";
import FieldSet from "@Components/FieldSet";
import Heading from "@Components/Heading";
import { RadioGroup } from "@Discord/Modules";

function Status() {
	const val = Settings.statusToUse();
	return (
		<>
			<Heading
				tag="legend"
				variant="text-md/medium">
				Status to use for whitelist
			</Heading>
			<RadioGroup
				options={[
					{
						name: "Online",
						value: "online"
					},
					{
						name: "Idle",
						value: "idle"
					},
					{
						name: "Do Not Disturb",
						value: "dnd",
						default: true
					},
					{
						name: "Invisible",
						value: "invisible"
					}
				]}
				orientation={"horizontal"}
				value={val}
				onChange={e => Settings.statusToUse.set(e.value)}
			/>
		</>
	);
}

function processIds(value) {
	return value
		.replace(/\s/g, "")
		.split(",")
		.filter(id => id.trim() !== "")
		.join(", ");
}

export default () => (
	<div className={`${config.info.name}-settings`}>
		<FieldSet contentGap={8}>
			{[
				{
					border: true,
					processValue: processIds,
					label: "Guild ids to let bypass (notified when pinged anywhere in guild)",
					placeholder: "Separate with commas",
					setting: Settings.guilds
				},
				{
					border: true,
					processValue: processIds,
					label: "Channel ids to let bypass (notified when pinged in that channel)",
					placeholder: "Separate with commas",
					setting: Settings.channels
				},
				{
					border: true,
					processValue: processIds,
					label: "User ids to let bypass (notified for all messages sent in DMs)",
					placeholder: "Separate with commas",
					setting: Settings.users
				}
			].map(SettingTextInput)}

			{[
				
				{
					border: true,
					note: "Only get notified for messages that mentions you",
					description: "Mentions only",
					setting: Settings.mentionOnly
				},{
					border: true,
					note: "Allow selected users to bypass status outside of DMs too (acts like a channel/guild bypass, but it's for all messages sent by the selected users)",
					description: "Allow outside of DMs",
					setting: Settings.allowOutsideOfDms
				},
				{
					border: true,
					note: "Whether the notification sound should be played",
					description: "Notification sound",
					setting: Settings.notificationSound
				},
				{
					border: true,
					note: "Respect silent pings (@silent / suppress notifications)",
					description: "Respect silent pings",
					setting: Settings.respectSilentPings
				}
			].map(SettingSwtich)}
			<Status />
		</FieldSet>
	</div>
);
