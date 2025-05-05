import { DOM, Patcher, React, showConfirmationModal } from "@Api";
import ErrorBoundary from "@Components/ErrorBoundary";

// import Collapsible from "@Components/Collapsible";
// console.log(Collapsible);
// import { EmojiSendAvailabilityEnum } from "@Discord/Enums";


const App = () => {
	const [tabs, setTabs] = React.useState([]);

	const newTabHandler = () => {
		setTabs([...tabs, {}]);
	};

	return 	<Tabs addNewTab={newTabHandler}>
		{tabs.map(() => <Tab />)}
	</Tabs>
};


function Tab({onClick}){

	return <div onClick={onClick}>
		<div className="tab-icon">☺</div>
		<div className="tab-title">some tab title</div>
		<div className="tab-close">x</div>
	</div>
}

function Tabs({children, addNewTab}){
	const [showLeftArrow, setShowLeftArrow] = React.useState(false); 
	const [showRightArrow, setShowRightArrow] = React.useState(false); 

	return <div className="tabs-container">
		{showLeftArrow && <div className="left-arrow"/>}
		<div className="tabs-list">{children}</div>
		<div className="new-tab" onClick={addNewTab}>+</div>
		{showRightArrow && <div className="right-arrow"/>}
	</div>
}



showConfirmationModal("", <App />);








export default () => {
	return {
		start() {
			// eslint-disable-next-line no-undef
			css ?? DOM.addStyle(css);

			// console.log(EmojiSendAvailabilityEnum);
		},
		stop() {
			DOM.removeStyle();
			Patcher.unpatchAll();
		}
	};
};
