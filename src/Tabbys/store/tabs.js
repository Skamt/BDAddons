import zustand, { subscribeWithSelector } from "@Discord/zustand";
import { remove, slice, arrayMove, meta, set, add } from "@Utils/Array";
import { createFrom, createFromPath, addBy, mergeArrayItem, setArrayItem, reOrder } from "./shared";
import { parsePath } from "@/utils";

const getters = {
	getTabIndex(id) {
		return this.state.tabs.findIndex(tab => tab.id === id);
	},
	getSelectedTabIndex() {
		return this.getTabIndex(this.state.selectedId);
	},
	getTab(id) {
		return this.state.tabs[this.getTabIndex(id)];
	},
	getSelectedTab() {
		return this.state.tabs[this.getSelectedTabIndex()];
	},
	getTabMeta(id) {
		return meta(this.state.tabs, tab => tab.id === id);
	},
	getTabsCount() {
		return this.state.tabs.length;
	}
};

const setters = {
	setTabs(tabs) {
		if (tabs && Array.isArray(tabs)) this.setState({ tabs });
	},
	setSelectedId(id) {
		if (this.getTabIndex(id) === -1) return;
		this.setState({ selectedId: id, lastSelectedIdAfterNewTab: null });
	},
	setTab(tabId, payload) {
		this.setState({ tabs: setArrayItem(this.state.tabs, tabId, payload) });
	},
	updateTab(tabId, payload) {
		this.setState({ tabs: mergeArrayItem(this.state.tabs, tabId, payload) });
	},
	setTabPath(tabId, path) {
		if (path) this.setTab(tabId, { id: tabId, path, ...parsePath(path) });
	}
};

export default {
	state: {
		tabs: [],
		selectedId: null,
		lastSelectedIdAfterNewTab: null
	},
	selectors: {
		tabs: state => state.tabs,
		// isSingleTab: state => state.tabs.length === 1,
		selectedId: state => state.selectedId,
		lastSelectedIdAfterNewTab: state => state.lastSelectedIdAfterNewTab
	},
	actions: {
		...getters,
		...setters,

		newTab(path) {
			const { selectedId, tabs } = this.state;
			const tab = createFromPath(path);
			this.setState({
				tabs: add(tabs, tab),
				selectedId: tab.id,
				lastSelectedIdAfterNewTab: selectedId
			});
		},
		reOrderTabs(fromId, toId, pos) {
			this.setTabs(reOrder(this.state.tabs, fromId, toId, pos));
		},

		addTabBy(tab, targetId, fn) {
			this.setState({ tabs: addBy(this.state.tabs, targetId, tab, fn) });
		},

		addTab(path) {
			this.addTabBy(createFromPath(path));
		},

		addTabToRight(tabId) {
			this.addTabBy(createFromPath(), tabId, a => a + 1);
		},

		addTabToLeft(tabId) {
			this.addTabBy(createFromPath(), tabId);
		},

		duplicateTab(tabId) {
			const tab = this.getTab(tabId);
			if (tab) this.addTabBy(createFrom(tab), tabId, a => a + 1);
		},

		removeTab(id) {
			const { selectedId, lastSelectedIdAfterNewTab, tabs } = this.state;
			if (tabs.length === 1) return; // keep at least one tab

			const { index, nextItem: next, previousItem: previous, isSingle } = this.getTabMeta(id);
			const isSelected = selectedId === id;
			const newSelected = !isSelected ? selectedId : lastSelectedIdAfterNewTab ? lastSelectedIdAfterNewTab : next ? next.id : previous.id;
			this.setState({
				tabs: remove(tabs, index),
				selectedId: newSelected,
				lastSelectedIdAfterNewTab: null
			});
		}
	}
};
