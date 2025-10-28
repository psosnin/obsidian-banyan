import { ItemView, WorkspaceLeaf, Platform } from "obsidian";
import BanyanPlugin from "src/main";
import { StrictMode, useEffect, useState } from 'react';
import { Root, createRoot } from 'react-dom/client';
import * as React from "react";
import CardNote from "./cards/CardNote";
import Sidebar from "./sidebar/Sidebar";
import { SimplifiedSidebarContent } from "./sidebar/SimplifiedSidebarContent";
import { useCombineStore } from "src/store";
import './simplified.css';

export const CARD_DASHBOARD_VIEW_TYPE = "dashboard-view";

export class CardDashboard extends ItemView {
  root: Root | null = null;
  plugin: BanyanPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: BanyanPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return CARD_DASHBOARD_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Banyan";
  }

  getIcon(): string {
    return 'wallet-cards';
  }

  async onOpen() {
    this.root = createRoot(this.containerEl.children[1]);
    this.root.render(
      <StrictMode>
        <SimplifiedCardDashboard plugin={this.plugin} />
      </StrictMode>
    );
    return;
  }

  async onClose() {
    this.root?.unmount();
  }
}

const SimplifiedCardDashboard = ({ plugin }: { plugin: BanyanPlugin }) => {
  const dashboardRef = React.useRef<HTMLDivElement>(null);
  
  const loadAllFiles = useCombineStore((state) => state.loadAllFiles);
  const selectedTopicNote = useCombineStore((state) => state.selectedTopicNote);
  const settings = useCombineStore((state) => state.settings);
  
  const [showSidebar, setShowSidebar] = useState<'normal' | 'hide' | 'show'>(Platform.isMobile ? 'hide' : 'normal');

  console.log('SimplifiedCardDashboard render - selectedTopicNote:', selectedTopicNote);
  console.log('SimplifiedCardDashboard render - settings:', settings);

  useEffect(() => {
    loadAllFiles();
  }, [loadAllFiles]);

  useEffect(() => {
    const updateSidebarVisibility = () => {
      if (Platform.isMobile) {
        setShowSidebar('hide');
        return;
      }
      if (!dashboardRef.current) return;
      const containerWidth = dashboardRef.current.clientWidth;
      const _showSidebar = containerWidth >= 920 ? 'normal' : 'hide';
      setShowSidebar(_showSidebar);
    };

    updateSidebarVisibility();

    const resizeObserver = new ResizeObserver(updateSidebarVisibility);
    if (dashboardRef.current) {
      resizeObserver.observe(dashboardRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="dashboard-container simplified" ref={dashboardRef}>
      {showSidebar != 'normal' && (
        <Sidebar visible={showSidebar == 'show'} onClose={() => setShowSidebar('hide')}>
          <SimplifiedSidebarContent />
        </Sidebar>
      )}
      {showSidebar == 'normal' && (
        <div className="sidebar-content-wrapper">
          <SimplifiedSidebarContent />
        </div>
      )}
      
      <div className="main-container simplified">
        {/* Topic Note Display */}
        <div className="topic-note-panel full-height">
          {selectedTopicNote ? (
            <CardNote fileInfo={selectedTopicNote} />
          ) : (
            <div className="empty-state">
              <p>Select a topic from the sidebar to view its note</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
