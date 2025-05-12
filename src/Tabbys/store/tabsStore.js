import List from "@Utils/List";
import { buildTab } from "@/utils";

const initialState = {
	tabs: [],
	selectedId: null,
	lastSelectedIdAfterNewTab: null
};

const tabsList = new List("id");

const store = (set, get) => ({
	...initialState,

	clearTabs() {
		tabsList.clear();
		set({ ...initialState });
	},

	setTabs(list = []) {
		if (list.length === 0) return;
		tabsList.setList(list);
		set({ tabs: tabsList.list, selectedId: tabsList.list[0].id });
	},

	addTab(tab) {
		tabsList.addItem(tab);
		set({ tabs: tabsList.list });
	},

	addTabToLeft(id, tab) {
		const tabIndex = tabsList.getItemIndex(id);
		tabsList.addItemAtIndex(tab, tabIndex);
		set({ tabs: tabsList.list, selectedId: tab.id });
	},

	addTabToRight(id, tab) {
		const tabIndex = tabsList.getItemIndex(id);
		tabsList.addItemAtIndex(tab, tabIndex + 1);
		set({ tabs: tabsList.list, selectedId: tab.id });
	},

	duplicateTab(id) {
		const { getTab, addTabToRight } = get();
		addTabToRight(id, buildTab(getTab(id)));
	},

	newTab(tab) {
		if (!tab.id) return;
		const state = get();

		tabsList.addItem(tab);
		set({ tabs: tabsList.list, selectedId: tab.id, lastSelectedIdAfterNewTab: state.selectedId });
	},

	removeTab(id) {
		const { selectedId, lastSelectedIdAfterNewTab } = get();
		if (tabsList.length === 1) return;
		const { nextItem: nextTab, previousItem: previousTab } = tabsList.getItemMeta(id);
		tabsList.removeItemByIdentifier(id);

		const isSelected = selectedId === id;
		const newSelected = !isSelected ? selectedId : lastSelectedIdAfterNewTab ? lastSelectedIdAfterNewTab : nextTab ? nextTab.id : previousTab.id;

		set({ tabs: tabsList.list, selectedId: newSelected, lastSelectedIdAfterNewTab: null });
	},

	removeOtherTabs(id) {
		const { getTab, setTabs } = get();
		const tab = getTab(id);
		setTabs([tab]);
	},

	removeTabsToRight(id) {
		const { selectedId } = get();
		const tabMeta = tabsList.getItemMeta(id);
		if (tabMeta.isLast || tabMeta.isSingle) return;
		const selectedTabIndex = tabsList.getItemIndex(selectedId);
		const to = tabMeta.index + 1;
		const newList = tabsList.getListSlice(0, to);
		const newSelected = selectedTabIndex < to ? selectedId : newList[0].id;
		tabsList.setList(newList);

		set({ tabs: tabsList.list, selectedId: newSelected });
	},

	removeTabsToLeft(id) {
		const { selectedId } = get();
		const tabMeta = tabsList.getItemMeta(id);
		if (tabMeta.isFirst || tabMeta.isSingle) return;

		const selectedTabIndex = tabsList.getItemIndex(selectedId);
		const newList = tabsList.getListSlice(tabMeta.index, tabsList.length);
		const newSelected = selectedTabIndex > tabMeta.index ? selectedId : newList[0].id;
		tabsList.setList(newList);
		set({ tabs: tabsList.list, selectedId: newSelected });
	},

	swapTab(fromTabId, toTabId) {
		tabsList.swapItemById(fromTabId, toTabId);
		set({ tabs: tabsList.list });
	},

	setSelectedId(id) {
		const { getTab } = get();
		const tabToBeSelected = getTab(id);
		if (!tabToBeSelected) return;
		set({ selectedId: id, lastSelectedIdAfterNewTab: null });
	},

	setTab(id, payload) {
		tabsList.setItemById(id, payload);
		set({ tabs: tabsList.list });
	},

	getTab(id) {
		return tabsList.getItemById(id);
	},

	getTabIndex(id) {
		return tabsList.getItemIndex(id);
	},

	getCurrentlySelectedTab() {
		return tabsList.getItemById(get().selectedId);
	}
});

const selectors = {
	tabs: state => state.tabs,
	isSingleTab: state => state.tabs.length === 1,
	selectedId: state => state.selectedId,
	lastSelectedIdAfterNewTab: state => state.lastSelectedIdAfterNewTab
};

export default {
	store,
	selectors
};
