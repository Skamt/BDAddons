import zustand, { subscribeWithSelector } from "@Discord/zustand";
import { remove, slice, arrayMove, meta, set, add } from "@Utils/Array";

const initialState = {
	tabs: [],
	selectedId: null,
	lastSelectedIdAfterNewTab: null
};

function createTab(payload = {}) {
	const id = crypto.randomUUID();
	const tab = { ...payload, id };
	if (!tab.path) tab.path = "/channels/@me";
	return tab;
}

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

export default {
	state: { ...initialState },
	selectors: {
		tabs: state => state.tabs,
		// isSingleTab: state => state.tabs.length === 1,
		selectedId: state => state.selectedId,
		lastSelectedIdAfterNewTab: state => state.lastSelectedIdAfterNewTab
	},
	actions: {
		...getters,
		addTabBy(targetId, payload, fn = a => a) {
			const tab = createTab(payload);
			const targetIndex = targetId ? this.getTabIndex(targetId) : this.state.tabs.length;
			if (targetIndex === -1) return;
			this.setState({ tabs: add(this.state.tabs, tab, fn(targetIndex)) });
		},
		addTab(payload) {
			this.addTabBy(null, payload);
		},
		addTabToRight(targetId) {
			this.addTabBy(targetId, null, a => a + 1);
		},
		addTabToLeft(targetId) {
			this.addTabBy(targetId, null);
		},
		duplicateTab(tabId) {
			const tab = this.getTab(tabId);
			if (tab) this.addTabToRight(tabId, tab);
		},

		newTab(payload = {}) {
			const { selectedId, tabs } = this.state;
			const tab = createTab(payload);
			this.setState({ tabs: add(tabs, tab), selectedId: tab.id, lastSelectedIdAfterNewTab: selectedId });
		},

		setTabPath(tabId, payload = {}) {
			if (!tabId) return;
			const index = this.getTabIndex(tabId);
			if (index === -1) return;
			const tab = this.state.tabs[index];

			const nTab = Object.assign({}, tab, payload);
			this.setState({ tabs: set(this.state.tabs, index, nTab) });
		},

		setTabFromBookmark(tabId, bookmarkId) {
			const bookmark = this.getBookmark(bookmarkId);
			if (bookmark) this.setTabPath(tabId, bookmark);
		},

		setSelectedTab(payload) {
			this.setTabPath(this.state.selectedId, payload);
		},

		bookmarkTab(id, folderId) {
			const tab = this.getTab(id);
			if (!tab) return;
			// if (folderId) this.addToFolder(folderId, tab.path);
			else this.addBookmark(tab);
		},

		setSelectedId(id) {
			if (this.getTabIndex(id) === -1) return;
			this.setState({ selectedId: id, lastSelectedIdAfterNewTab: null });
		},
		moveTab(fromId, toId, pos) {
			if (!fromId || !toId) return;

			const fromIndex = this.state.tabs.findIndex(a => a.id === fromId);
			let toIndex = this.state.tabs.findIndex(a => a.id === toId);
			if (fromIndex === -1 || toIndex === -1) return;
			if (pos === "before" && toIndex > fromIndex) {
				toIndex--;
			}
			if (pos === "after" && toIndex < fromIndex) {
				toIndex++;
			}

			this.setState({ tabs: arrayMove(this.state.tabs, fromIndex, toIndex) });
		},

		removeTab(id) {
			const { selectedId, lastSelectedIdAfterNewTab, tabs } = this.state;
			if (tabs.length === 1) return; // keep at least one tab

			const { index, nextItem: next, previousItem: previous, isSingle } = this.getTabMeta(id);
			const isSelected = selectedId === id;
			const newSelected = !isSelected ? selectedId : lastSelectedIdAfterNewTab ? lastSelectedIdAfterNewTab : next ? next.id : previous.id;
			this.setState({ tabs: remove(tabs, index), selectedId: newSelected, lastSelectedIdAfterNewTab: null });
		},
		removeTabsToRight(id) {
			if (!id) return;
			const { index, isLast, isSingle } = this.getTabMeta(id);
			if (index === -1) return;
			if (isLast || isSingle) return;

			const { selectedId, tabs } = this.state;

			const selectedTabIndex = this.getSelectedTabIndex();
			const to = index + 1;
			const newList = slice(tabs, 0, to);
			const newSelected = selectedTabIndex < to ? selectedId : id;

			this.setState({ tabs: newList, selectedId: newSelected });
		},
		removeTabsToLeft(id) {
			if (!id) return;
			const { index, isFirst, isSingle } = this.getTabMeta(id);
			if (index === -1) return;
			if (isFirst || isSingle) return;

			const { selectedId, tabs } = this.state;

			const selectedTabIndex = this.getSelectedTabIndex();
			const newList = slice(tabs, index, tabs.length);
			const newSelected = selectedTabIndex > index ? selectedId : id;

			this.setState({ tabs: newList, selectedId: newSelected });
		},
		removeOtherTabs(id) {
			const tab = this.getTab(id);
			if (tab) this.setState({ tabs: [tab], selectedId: tab.id, lastSelectedIdAfterNewTab: null });
		}
	}
};
