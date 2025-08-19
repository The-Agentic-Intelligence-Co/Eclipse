import React from 'react';
import Header from './side-panel/components/Header';
import Content from './side-panel/components/Content';
import Footer from './side-panel/components/Footer';
import { useChromeAPI } from './hooks/useChromeAPI';
import { useTabManagement } from './hooks/useSystem';

const App = () => {
  useChromeAPI(); // Solo para logging, no necesitamos el return

  // Hook para gestión de pestañas - ahora compartido entre Content y Footer
  const {
    tabs,
    selectedTabs,
    showCurrentTabIndicator,
    currentActiveTab,
    addTab,
    removeTab,
    toggleCurrentTab,
    removeCurrentTab,
    totalSelected,
    maxLimit
  } = useTabManagement();

  return (
    <div className="sidebar-container">
      <Header />
      <Content 
        selectedTabs={selectedTabs}
        tabs={tabs}
        showCurrentTabIndicator={showCurrentTabIndicator}
        currentActiveTab={currentActiveTab}
        addTab={addTab}
        removeTab={removeTab}
        toggleCurrentTab={toggleCurrentTab}
        removeCurrentTab={removeCurrentTab}
        totalSelected={totalSelected}
        maxLimit={maxLimit}
      />
      <Footer 
        selectedTabs={selectedTabs}
        tabs={tabs}
        showCurrentTabIndicator={showCurrentTabIndicator}
        currentActiveTab={currentActiveTab}
        addTab={addTab}
        removeTab={removeTab}
        toggleCurrentTab={toggleCurrentTab}
        removeCurrentTab={removeCurrentTab}
        totalSelected={totalSelected}
        maxLimit={maxLimit}
      />
    </div>
  );
};

export default App;
