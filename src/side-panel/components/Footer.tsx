import React, { useRef } from 'react';
import { useDropdownManagement, useFooterState } from '../../hooks/ui';
import { useTabIndicators } from '../../hooks/tabs';
import { formatTabTitle, formatTabTitleShort, shouldShowPlaceholder, getDefaultFavicon, handleFaviconError, isCurrentActiveTab, isTabSelected } from '../../utils/helpers';
import { handleTabSelection, handleContextOption } from '../../services/tabs';
import { MODES, CONTEXT_OPTIONS, ICONS, TAB_LIMITS } from '../../constants';
import type { FooterProps, Tab } from '../../types/hooks';

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
  const {
    selectedMode,
    content,
    isFocused,
    handleInput,
    handleFocus,
    clearContent,
    hasContent,
    changeMode
  } = useFooterState();

  const {
    isContextDropdownOpen,
    isModeDropdownOpen,
    showTabSelection,
    toggleContextDropdown,
    toggleModeDropdown,
    showTabSelectionMode,
    hideTabSelectionMode,
    closeAllDropdowns
  } = useDropdownManagement();

  const {
    hoveredIndicator,
    setHoveredIndicator
  } = useTabIndicators(selectedTabs, currentActiveTab, showCurrentTabIndicator, addTab, removeTab, removeCurrentTab);

  const selectedModeData = MODES.find(mode => mode.value === selectedMode);

  // Manejadores de eventos
  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLSpanElement>): void => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const handleSubmit = (): void => {
    if (hasContent()) {
      window.dispatchEvent(new CustomEvent('addUserMessage', { 
        detail: {
          message: content.trim(),
          mode: selectedMode
        }
      }));
      
      clearContent();
      
      if (spanRef.current) {
        spanRef.current.innerHTML = '&nbsp;';
      }
    }
  };

  const handleContextOptionClick = (option: { value: string }): void => {
    if (option.value === 'select-tab') {
      showTabSelectionMode();
    } else if (option.value === 'current-tab') {
      const result = handleContextOption(option, currentActiveTab, selectedTabs, toggleCurrentTab, removeTab);
      if (result.success) {
        closeAllDropdowns();
      } else {
        closeAllDropdowns();
      }
    } else {
      closeAllDropdowns();
    }
  };

  const handleTabSelectionClick = (tab: Tab): void => {
    const result = handleTabSelection(tab, selectedTabs, currentActiveTab, showCurrentTabIndicator, addTab, removeTab, removeCurrentTab);
    if (!result.success) {
      closeAllDropdowns();
    }
  };

  const handleGoBack = (): void => {
    hideTabSelectionMode();
  };

  const handleRemoveCurrentTab = (): void => {
    removeCurrentTab();
  };

  const handleRemoveSelectedTab = (tabId: number): void => {
    removeTab(tabId);
  };

  const showPlaceholder = shouldShowPlaceholder(content, isFocused);

  // Renderizar las opciones del dropdown
  const renderDropdownOptions = (): React.ReactNode => {
    if (showTabSelection) {
      return (
        <>
          <button
            className="context-dropdown-option go-back-option"
            onClick={handleGoBack}
          >
            ← Go Back
          </button>
          <div className="dropdown-divider"></div>
          <div className="tabs-scroll-container">
            {tabs.map((tab) => {
              const isSelected = isTabSelected(tab, selectedTabs);
              const isCurrentActive = isCurrentActiveTab(tab, currentActiveTab, showCurrentTabIndicator);
              const shouldShowCheckmark = isSelected || isCurrentActive;
              
              return (
                <button
                  key={tab.id}
                  className="context-dropdown-option tab-option"
                  onClick={() => handleTabSelectionClick(tab)}
                >
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
                      <img 
                        src={ICONS.checkmark} 
                        alt="Selected" 
                        className="tab-checkmark"
                      />
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
      <button
        key={option.value}
        className="context-dropdown-option"
        onClick={() => handleContextOptionClick(option)}
      >
        <div className="context-option-content">
          <div className="context-option-left">
            <img 
              src={option.icon} 
              alt={option.label} 
              className="context-option-icon"
            />
            <span>{option.label}</span>
          </div>
          {option.value === 'current-tab' && showCurrentTabIndicator && (
            <img 
              src={ICONS.checkmark} 
              alt="Selected" 
              className="context-checkmark"
            />
          )}
        </div>
      </button>
    ));
  };

  return (
    <div className="footer-container">
      <div className="footer-row">
        <div className="context-dropdown">
          <button 
            className="context-button"
            onClick={toggleContextDropdown}
          >
            @ Add Context
          </button>
          {isContextDropdownOpen && (
            <div className="context-dropdown-options">
              {renderDropdownOptions()}
            </div>
          )}
        </div>
        {showCurrentTabIndicator && (
          <div 
            className="current-tab-indicator"
            onMouseEnter={() => setHoveredIndicator('current-tab')}
            onMouseLeave={() => setHoveredIndicator(null)}
            onClick={handleRemoveCurrentTab}
          >
            <img 
              src={hoveredIndicator === 'current-tab' ? ICONS.delete : ICONS.tab} 
              alt="Current Tab" 
              className="current-tab-icon"
            />
            Current tab
            {/* Debug: Mostrar info de la pestaña actual */}
            {currentActiveTab && (
              <span style={{fontSize: '10px', marginLeft: '5px'}}>
                ({currentActiveTab.title?.substring(0, 15)}...)
              </span>
            )}
          </div>
        )}
        {selectedTabs.map((tab) => (
          <div 
            key={tab.id} 
            className="selected-tab-indicator"
            onMouseEnter={() => setHoveredIndicator(`tab-${tab.id}`)}
            onMouseLeave={() => setHoveredIndicator(null)}
            onClick={() => handleRemoveSelectedTab(tab.id)}
          >
            <img 
              src={hoveredIndicator === `tab-${tab.id}` ? ICONS.delete : (tab.favIconUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiByeD0iMiIgZmlsbD0iIzY2NjY2NiIvPgo8L3N2Zz4K')} 
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
          onInput={handleInput}
          onFocus={() => handleFocus(true)}
          onBlur={() => handleFocus(false)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          data-placeholder="Plan, search, do anything..."
        ></span>
      </div>
      <div className="footer-row">
        <div className="footer-column">
          <div className="custom-select">
            <button 
              className="select-button"
              onClick={toggleModeDropdown}
            >
              <img src={selectedModeData?.icon} alt={selectedModeData?.label} className="option-icon" />
              {selectedModeData?.label}
            </button>
            {isModeDropdownOpen && (
              <div className="dropdown-options">
                {MODES.map((mode) => (
                  <button
                    key={mode.value}
                    className={`dropdown-option ${selectedMode === mode.value ? 'selected' : ''}`}
                    onClick={() => {
                      changeMode(mode.value);
                      toggleModeDropdown();
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
            className={`circular-button ${hasContent() ? 'has-content' : ''}`}
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
