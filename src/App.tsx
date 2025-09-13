import React, { useState } from 'react';
import Header from './side-panel/components/Header';
import Content from './side-panel/components/Content';
import Footer from './side-panel/components/Footer';
import { useTabManagement } from './hooks/useSystem';
import type { AppProps } from './types/hooks';

const App: React.FC<AppProps> = () => {

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

  // Estado para saber si el chat ha comenzado
  const [hasStartedChat, setHasStartedChat] = useState<boolean>(false);

  return (
    <div className="sidebar-container">
      <Header hasStartedChat={hasStartedChat} />
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
        onChatStart={() => setHasStartedChat(true)}
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
