import Plugin from "@common/Plugin";
import React from "@React";
import { after, before } from "@common/Patcher";
// import { create, subscribeWithSelector } from "@Discord/zustand";
// import { setProp, mapDeep, getNestedProp } from "@Utils/Object";

// const settings = {
// 	"embed": {
// 		"embedBannerBackground": true,
// 		"spotifyEmbed": "REPLACE"
// 	},
// 	"activityIndicator": true,
// 	"enableListenAlong": true,
// 	"activity": true,
// 	"player": {
// 		"playerBannerBackground": true,
// 		"playerCompactMode": true,
// 		"spotifyPlayerPlace": "USERAREA",
// 		"showPlayer": true,
// 		"buttons": {
// 			"Share": true,
// 			"Shuffle": true,
// 			"Previous": true,
// 			"Play": true,
// 			"Next": true,
// 			"Repeat": true,
// 			"Volume": true
// 		}
// 	}
// };

// const SettingsStore = create(subscribeWithSelector(() => Object.assign({}, settings)));

// Object.assign(SettingsStore, {
// 	actions: mapDeep(SettingsStore.getInitialState(), ({ path, key }) =>
// 		Object.assign(() => getNestedProp(SettingsStore.state, path), {
// 			set: v => SettingsStore.setState(setProp({ ...SettingsStore.state }, path, v)),
// 			key,
// 			path
// 		})
// 	)
// });

// SettingsStore.subscribe(SettingsStore.actions.player.playerCompactMode, console.log);

// DEV: {
// 	window.TEST = SettingsStore;
// }

// import React from "@React";
// import { nop } from "@Utils";
// import Switch from "@Components/Switch";
// import Divider from "@Components/Divider";
// import FieldSet from "@Components/FieldSet";

// function SettingSwtich({ setting, note, border = false, onChange = nop, description, ...rest }) {
// 	const val = SettingsStore(setting);
// 	return (
// 		<>
// 			<Switch
// 				{...rest}
// 				hasIcon={true}
// 				checked={val}
// 				label={description || setting.key}
// 				description={note}
// 				onChange={e => {
// 					setting.set(e);
// 					onChange?.(e);
// 				}}
// 			/>
// 			{border && <Divider gap={15} />}
// 		</>
// 	);
// }

// function Comp() {
// 	return (
// 		<FieldSet contentGap={8}>
// 			{[
// 				{
// 					border: true,
// 					setting: SettingsStore.actions.player.playerCompactMode
// 				},

// 				{
// 					setting: SettingsStore.actions.player.buttons.Volume
// 				}
// 			].map(SettingSwtich)}
// 		</FieldSet>
// 	);
// }


Plugin.onStart(() => {
	
});

module.exports = () => Plugin;
