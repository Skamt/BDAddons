import { Patcher } from "@Api";
import React from "@React";
import { Filters, getDeclarationAndKey } from "@Webpack";
import { MessageHeader as MessageHeaderPromise } from "@Discord/Modules";
import Plugin, { Events } from "@Utils/Plugin";

const ExpressionPicker = BdApi.Webpack.getModule((m) => m.type?.toString?.().includes("onSelectGIF"), {
	searchExports: true,
});
Plugin.on(Events.START, async () => {
	// Patcher.after(ExpressionPicker, "type", (_, args, ret) => {
	// 	if (ret.props?.children?.props?.children == null) return ret;
	// 	const unpatch = Patcher.after(ret.props.children.props, "children", (_, args, ret) => {
	// 		unpatch();
	// 		if (ret == null) return;
	// 		const body = BdApi.Utils.findInTree(ret, (el) => el?.[0]?.type === "nav", {
	// 			walkable: ["props", "children"],
	// 		});
	// 		const head = BdApi.Utils.findInTree(body, (el) => el?.[0]?.props?.["aria-selected"] !== void 0, {
	// 			walkable: ["props", "children"],
	// 		});

	// 		const TabButtonComponent =  head?.[0].type.type;
	// 		if(TabButtonComponent)
	// 		head.push(<TabButtonComponent 
	// 			id="myTab"
	// 			aria-controls= "picker-tab-panel"
	// 			aria-selected={false}
	// 			className='fm-pickerTab'
	// 			viewType={"MyTab"}
	// 			isActive={false}
	// 			> My Tab </TabButtonComponent>);
	// 		// console.log(body, head);
	// 	});
	// });
});

Plugin.on(Events.STOP, () => {
	Patcher.unpatchAll();
});

module.exports = () => Plugin;
