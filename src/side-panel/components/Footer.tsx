import React, { useRef } from 'react';
import { useDropdownManagement, useFooterState } from '../../hooks/ui';
import { useTabIndicators } from '../../hooks/tabs';
import { formatTabTitle, formatTabTitleShort, shouldShowPlaceholder, getDefaultFavicon, handleFaviconError, isCurrentActiveTab, isTabSelected } from '../../utils/helpers';
import { handleTabSelection, handleContextOption } from '../../services/tabs';
import { MODES, CONTEXT_OPTIONS, ICONS, TAB_LIMITS } from '../../constants';
import type { FooterProps, Tab } from '../../types/hooks';

// Helper functions for cleaner code
const createTabIcon = (tab: Tab, hoveredIndicator: string | null) => {
  const isHovered = hoveredIndicator === `tab-${tab.id}`;
  return isHovered ? ICONS.delete : (tab.favIconUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiByeD0iMiIgZmlsbD0iIzY2NjY2NiIvPgo8L3N2Zz4K');
};

const createCurrentTabIcon = (hoveredIndicator: string | null) => {
  return hoveredIndicator === 'current-tab' ? ICONS.delete : ICONS.tab;
};

const Footer: React.FC<FooterProps> = ({ 
  selectedTabs, 
  tabs, 
  showCurrentTabIndicator, 
  currentActiveTab,
  addTab, 
  removeTab, 
  toggleCurrentTab, 
  removeCurrentTab, 
  totalSelected, 
  maxLimit 
}) => {
  const spanRef = useRef<HTMLSpanElement>(null);

  // Hooks personalizados
  const footerState = useFooterState();
  const dropdownState = useDropdownManagement();
  const tabIndicators = useTabIndicators();

  const selectedModeData = MODES.find(mode => mode.value === footerState.selectedMode);
  const showPlaceholder = shouldShowPlaceholder(footerState.content, footerState.isFocused);

  // Event handlers
  const handleSubmit = () => {
    if (footerState.hasContent()) {
      window.dispatchEvent(new CustomEvent('addUserMessage', { 
        detail: { message: footerState.content.trim(), mode: footerState.selectedMode }
      }));
      footerState.clearContent();
      if (spanRef.current) spanRef.current.innerHTML = '&nbsp;';
    }
  };

  const handleContextOptionClick = (option: { value: string }) => {
    if (option.value === 'select-tab') {
      dropdownState.showTabSelectionMode();
    } else if (option.value === 'current-tab') {
      handleContextOption(option, currentActiveTab, selectedTabs, toggleCurrentTab, removeTab);
      dropdownState.closeAllDropdowns();
    } else {
      dropdownState.closeAllDropdowns();
    }
  };

  const handleTabSelectionClick = (tab: Tab) => {
    const result = handleTabSelection(tab, selectedTabs, currentActiveTab, showCurrentTabIndicator, addTab, removeTab, removeCurrentTab);
    if (!result.success) dropdownState.closeAllDropdowns();
  };

  // Render dropdown options
  const renderDropdownOptions = () => {
    if (dropdownState.showTabSelection) {
      return (
        <>
          <button className="context-dropdown-option go-back-option" onClick={dropdownState.hideTabSelectionMode}>
            ← Go Back
          </button>
          <div className="dropdown-divider"></div>
          <div className="tabs-scroll-container">
            {tabs.map((tab) => {
              const isSelected = isTabSelected(tab, selectedTabs);
              const isCurrentActive = isCurrentActiveTab(tab, currentActiveTab, showCurrentTabIndicator);
              const shouldShowCheckmark = isSelected || isCurrentActive;
              
              return (
                <button key={tab.id} className="context-dropdown-option tab-option" onClick={() => handleTabSelectionClick(tab)}>
                  <div className="tab-content">
                    <img 
                      src={tab.favIconUrl || getDefaultFavicon()} 
                      alt="Favicon" 
                      className="tab-favicon"
                      onError={(e) => handleFaviconError(e.nativeEvent)}
                    />
                    <div className="tab-title">
                      {formatTabTitle(tab.title, TAB_LIMITS.TITLE_MAX_LENGTH)}
                    </div>
                    {shouldShowCheckmark && (
                      <img src={ICONS.checkmark} alt="Selected" className="tab-checkmark" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      );
    }

    return CONTEXT_OPTIONS.map((option) => (
      <button key={option.value} className="context-dropdown-option" onClick={() => handleContextOptionClick(option)}>
        <div className="context-option-content">
          <div className="context-option-left">
            <img src={option.icon} alt={option.label} className="context-option-icon" />
            <span>{option.label}</span>
          </div>
          {option.value === 'current-tab' && showCurrentTabIndicator && (
            <img src={ICONS.checkmark} alt="Selected" className="context-checkmark" />
          )}
        </div>
      </button>
    ));
  };

  return (
    <div className="footer-container">
      <div className="footer-row">
        <div className="context-dropdown">
          <button className="context-button" onClick={dropdownState.toggleContextDropdown}>
            @ Add Context
          </button>
          {dropdownState.isContextDropdownOpen && (
            <div className="context-dropdown-options">
              {renderDropdownOptions()}
            </div>
          )}
        </div>
        
        {showCurrentTabIndicator && (
          <div 
            className="current-tab-indicator"
            onMouseEnter={() => tabIndicators.setHoveredIndicator('current-tab')}
            onMouseLeave={() => tabIndicators.setHoveredIndicator(null)}
            onClick={removeCurrentTab}
          >
            <img 
              src={createCurrentTabIcon(tabIndicators.hoveredIndicator)} 
              alt="Current Tab" 
              className="current-tab-icon"
            />
            Current tab
          </div>
        )}
        
        {selectedTabs.map((tab) => (
          <div 
            key={tab.id} 
            className="selected-tab-indicator"
            onMouseEnter={() => tabIndicators.setHoveredIndicator(`tab-${tab.id}`)}
            onMouseLeave={() => tabIndicators.setHoveredIndicator(null)}
            onClick={() => removeTab(tab.id)}
          >
            <img 
              src={createTabIcon(tab, tabIndicators.hoveredIndicator)} 
              alt="Favicon" 
              className="selected-tab-favicon"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <span className="selected-tab-title">
              {formatTabTitleShort(tab.title, TAB_LIMITS.TITLE_SHORT_MAX_LENGTH)}
            </span>
          </div>
        ))}
        
        {totalSelected >= 4 && (
          <div className="selection-counter">
            {totalSelected}/{maxLimit}
          </div>
        )}
      </div>
      
      <div className="footer-row">
        <span 
          ref={spanRef}
          contentEditable 
          className={`editable-span ${showPlaceholder ? 'placeholder' : ''}`}
          onInput={footerState.handleInput}
          onFocus={() => footerState.handleFocus(true)}
          onBlur={() => footerState.handleFocus(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
          }}
          data-placeholder="Plan, search, do anything..."
        ></span>
      </div>
      
      <div className="footer-row">
        <div className="footer-column">
          <div className="custom-select">
            <button className="select-button" onClick={dropdownState.toggleModeDropdown}>
              <img src={selectedModeData?.icon} alt={selectedModeData?.label} className="option-icon" />
              {selectedModeData?.label}
            </button>
            {dropdownState.isModeDropdownOpen && (
              <div className="dropdown-options">
                {MODES.map((mode) => (
                  <button
                    key={mode.value}
                    className={`dropdown-option ${footerState.selectedMode === mode.value ? 'selected' : ''}`}
                    onClick={() => {
                      footerState.changeMode(mode.value);
                      dropdownState.toggleModeDropdown();
                    }}
                  >
                    <img src={mode.icon} alt={mode.label} className="option-icon" />
                    {mode.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="footer-column">
          <button 
            className={`circular-button ${footerState.hasContent() ? 'has-content' : ''}`}
            onClick={handleSubmit}
          >
            <img src={ICONS.submit} alt="Submit" className="submit-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Footer;
