import React from 'react';
import { Icon } from "src/components/Icon";
import { Searchbar } from "./searchbar/Searchbar";
import { DefaultFilterSchemeID, getDefaultFilterScheme } from "src/models/FilterScheme";
import { i18n } from "src/utils/i18n";

interface HeaderViewProps {
  showSidebar: 'normal' | 'hide' | 'show';
  setShowSidebar: (state: 'normal' | 'hide' | 'show') => void;
  curScheme: any;
  filterSchemes: any[];
  setCurScheme: (scheme: any) => void;
}

export const HeaderView: React.FC<HeaderViewProps> = ({
  showSidebar,
  setShowSidebar,
  curScheme,
  filterSchemes,
  setCurScheme
}) => {
  return (
    <div className="main-header-container">
      <div className="main-header-title">
        <button 
          className={"clickable-icon " + (showSidebar == 'normal' ? "sidebar-toggle-button-hidden" : "sidebar-toggle-button-visible")}
          onClick={() => setShowSidebar('show')}
          title={i18n.t('expand_sidebar')}
        >
          <Icon name="menu" />
        </button>
        {curScheme.id === DefaultFilterSchemeID && (
          <div className="main-header-title-content">{curScheme.name}</div>
        )}
        {curScheme.id !== DefaultFilterSchemeID && (
          <div className="main-header-title-container">
            <div 
              className="main-header-title-content main-header-title-content-clickable" 
              onClick={() => {
                setCurScheme(getDefaultFilterScheme(filterSchemes));
              }}
            >
              {getDefaultFilterScheme(filterSchemes).name}
            </div>
            <div className="main-header-title-separator">{'/'}</div>
            <div className="main-header-title-content">{curScheme.name}</div>
          </div>
        )}
      </div>
      <Searchbar />
    </div>
  );
};
