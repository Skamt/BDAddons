import "./styles";
// import Store from "@/Store";
// import "./patches/*";
// import ErrorBoundary from "@Components/ErrorBoundary";
// import React from "@React";

import Plugin, { Events } from "@Utils/Plugin";
import { Patcher } from "@Api";

import { reRender } from "@Utils";



Plugin.on(Events.START, () => {});

Plugin.on(Events.STOP, () => {
	Patcher.unpatchAll();
	reRender(".base_c48ade"); // temp
});

module.exports = () => Plugin;
