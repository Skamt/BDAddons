import { DOM, React, Patcher } from "@Api";
// import TheBigBoyBundle from "@Modules/TheBigBoyBundle";

// const { Popout } = TheBigBoyBundle;

// const renderPopout = s(507418).exports.Z;

// function Username({userId}) {
// 	const [show, setShow] = React.useState(false);

// 	const clickHandler = () => {
// 		setShow(!show);
// 	};

// 	return (
// 		<Popout
// 			shouldShow={show}
// 			renderPopout={()=>renderPopout({},{type:0})}
// 			position="window_center">
// 			{() => <p onClick={clickHandler}>Some Name</p>}
// 		</Popout>
// 	);
// }

// window.test ?? TheBigBoyBundle.closeModal(window.test);
// window.test = BdApi.alert("", <Username userId="1030617301818552320"/>);

export default () => {
	return {
		start() {
			// eslint-disable-next-line no-undef
			css ?? DOM.addStyle(css);
		},
		stop() {
			DOM.removeStyle();
			Patcher.unpatchAll();
		}
	};
};

// const b = s(738619).exports;
// const unpatch = Patcher.after(b, "Z", (_, __, ret) => {
// 	unpatch();
// 	Patcher.after(ret.type.prototype, "render", console.log);
// });
