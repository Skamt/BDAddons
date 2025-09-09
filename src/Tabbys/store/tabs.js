import zustand, { subscribeWithSelector } from "@Discord/zustand";
import { remove, slice, meta, set, add } from "@Utils/Array";

const initialState = {
	tabs: [],
	selectedId: null,
	lastSelectedIdAfterNewTab: null
};

function createTab(path = "/channels/@me") {
	const id = crypto.randomUUID();
	return { id, path };
}

export default {
	state: { ...initialState },
	selectors: {
		tabs: state => state.tabs,
		// isSingleTab: state => state.tabs.length === 1,
		selectedId: state => state.selectedId,
		lastSelectedIdAfterNewTab: state => state.lastSelectedIdAfterNewTab
	},
	actions: {
		getTabsCount() {
			return this.state.tabs.length;
		},
		addTabToRight(id, path) {
			if (!id) return;
			const index = this.getTabIndex(id);
			if (index === -1) return;
			const tab = createTab(path);
			this.setState({ tabs: add(this.state.tabs, tab, index + 1), selectedId: tab.id });
		},
		addTabToLeft(id, path) {
			if (!id) return;
			const index = this.getTabIndex(id);
			if (index === -1) return;
			const tab = createTab(path);
			this.setState({ tabs: add(this.state.tabs, tab, index), selectedId: tab.id });
		},
		duplicateTab(id) {
			const tab = this.getTab(id);
			if (!tab) return;
			this.addTabToRight(id, tab.path);
		},
		bookmarkTab(id, folderId) {
			const tab = this.getTab(id);
			if (!tab) return;
			if(folderId) this.addToFolder(folderId, tab.path)
			else this.addBookmark(tab.path);
		},
		addTab(path) {
			if (!path) return;
			const tab = createTab(path);
			this.setState({ tabs: add(this.state.tabs, tab) });
		},
		newTab(path) {
			const { selectedId, tabs } = this.state;
			const tab = createTab(path);
			this.setState({ tabs: add(tabs, tab), selectedId: tab.id, lastSelectedIdAfterNewTab: selectedId });
		},
		getTab(id) {
			const index = this.getTabIndex(id);
			if (index === -1) return;
			return this.state.tabs[index];
		},
		getTabIndex(id) {
			return this.state.tabs.findIndex(a => a.id === id);
		},
		setSelectedId(id) {
			if (this.getTabIndex(id) === -1) return;
			this.setState({ selectedId: id, lastSelectedIdAfterNewTab: null });
		},
		removeTab(id) {
			const { selectedId, lastSelectedIdAfterNewTab, tabs } = this.state;
			if (tabs.length === 1) return; // keep at least one tab
			const index = this.getTabIndex(id);
			if (index === -1) return; // can't remove what you don't have

			const { nextItem: next, previousItem: previous, isSingle } = meta(tabs, index);
			const isSelected = selectedId === id;
			const newSelected = !isSelected ? selectedId : lastSelectedIdAfterNewTab ? lastSelectedIdAfterNewTab : next ? next.id : previous.id;
			this.setState({ tabs: remove(tabs, index), selectedId: newSelected, lastSelectedIdAfterNewTab: null });
		},
		removeTabsToRight(id) {
			if (!id) return;
			const index = this.getTabIndex(id);
			if (index === -1) return;
			const { selectedId, tabs } = this.state;
			const tabMeta = meta(tabs, index);

			if (tabMeta.isLast || tabMeta.isSingle) return;
			const selectedTabIndex = this.getSelectedTabIndex();
			const to = tabMeta.index + 1;
			const newList = slice(tabs, 0, to);
			const newSelected = selectedTabIndex < to ? selectedId : id;

			this.setState({ tabs: newList, selectedId: newSelected });
		},

		removeTabsToLeft(id) {
			if (!id) return;
			const index = this.getTabIndex(id);
			if (index === -1) return;
			const { selectedId, tabs } = this.state;
			const tabMeta = meta(tabs, index);

			if (tabMeta.isFirst || tabMeta.isSingle) return;

			const selectedTabIndex = this.getSelectedTabIndex();
			const newList = slice(tabs, tabMeta.index, tabs.length);
			const newSelected = selectedTabIndex > tabMeta.index ? selectedId : id;

			this.setState({ tabs: newList, selectedId: newSelected });
		},
		removeOtherTabs(id) {
			const tab = this.getTab(id);
			if (!tab) return;

			this.setState({ tabs: [tab], selectedId: tab.id, lastSelectedIdAfterNewTab: null });
		},
		getSelectedTabIndex() {
			const index = this.state.tabs.findIndex(a => a.id === this.state.selectedId);
			return index;
		},
		getSelectedTab() {
			const index = this.state.tabs.findIndex(a => a.id === this.state.selectedId);
			if (index === -1) return;
			return this.state.tabs[index];
		},
		setSelectedTab(path) {
			if (!path) return;
			const { tabs, selectedId } = this.state;
			const index = tabs.findIndex(a => a.id === selectedId);
			if (index === -1) return;
			const nTab = Object.assign({}, tabs[index], { path });
			this.setState({ tabs: set(tabs, index, nTab) });
		}
	}
};
