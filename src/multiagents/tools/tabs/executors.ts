/**
 * Ejecutores de herramientas de pestañas
 */

import { extractTabContent, extractMultipleTabsContent } from './extractor';
import type { Tab, ToolCall, ToolResult } from './types';

/**
 * Ejecuta la herramienta extract_tab_content
 */
export async function executeExtractTabContent(toolCall: ToolCall, selectedTabs: Tab[]): Promise<ToolResult> {
  const args = JSON.parse(toolCall.function.arguments);
  const { tabId } = args;

  // Verificar que la pestaña esté en las seleccionadas
  const tab = selectedTabs.find(t => t.id === tabId);
  if (!tab) {
    console.log('❌ Pestaña no encontrada. IDs disponibles:', selectedTabs.map(t => t.id));
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `Error: La pestaña con ID ${tabId} no está seleccionada o no existe. IDs disponibles: ${selectedTabs.map(t => t.id).join(', ')}`,
      success: false
    };
  }
  
  const content = await extractTabContent(tabId);
  console.log("Contenido extraído:", content);
  return {
    tool_call_id: toolCall.id,
    functionName: toolCall.function.name,
    content: `Contenido extraído de "${tab.title}" (${tab.url}):\n\n${content}`,
    success: true
  };
}

/**
 * Ejecuta la herramienta extract_multiple_tabs_content
 */
export async function executeExtractMultipleTabsContent(toolCall: ToolCall, selectedTabs: Tab[]): Promise<ToolResult> {
  // const args = JSON.parse(toolCall.function.arguments);
  // const { reason } = args; // No se usa actualmente
  
  const extractedContent = await extractMultipleTabsContent(selectedTabs);
  const formattedContent = extractedContent.map(item => 
    `**${item.title}** (${item.url}):\n${item.content}\n`
  ).join('\n---\n');
  
  console.log("Contenido extraído:", formattedContent);
  return {
    tool_call_id: toolCall.id,
    functionName: toolCall.function.name,
    content: `Contenido extraído de ${selectedTabs.length} pestañas:\n\n${formattedContent}`,
    success: true
  };
}

/**
 * Ejecuta la herramienta open_tab_with_url
 */
export async function executeOpenTabWithUrl(toolCall: ToolCall): Promise<ToolResult & { newTab?: chrome.tabs.Tab }> {
  const args = JSON.parse(toolCall.function.arguments);
  const { url } = args;
  
  try {
    // Validar y normalizar la URL
    let normalizedUrl = url;
    if (!url || url.trim() === '') {
      normalizedUrl = 'https://google.com';
    } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // Si no tiene protocolo, asumir https
      normalizedUrl = `https://${url}`;
    }
    
    // Crear nueva pestaña
    const newTab = await chrome.tabs.create({ url: normalizedUrl });
    
    // Esperar a que la página esté completamente cargada
    await waitForPageLoad(newTab.id!);
    
    console.log("Nueva pestaña creada y cargada:", newTab);
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `✅ Nueva pestaña abierta exitosamente con la URL: ${normalizedUrl}\n\n**Detalles de la pestaña:**\n- ID: ${newTab.id}\n- Título: ${newTab.title || 'Cargando...'}\n- URL: ${newTab.url || normalizedUrl}\n\n**Estado:** Página completamente cargada y lista para DOM read`,
      success: true,
      newTab: newTab
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al abrir nueva pestaña:', error);
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `❌ Error al abrir nueva pestaña: ${errorMessage}`,
      success: false
    };
  }
}

/**
 * Ejecuta la herramienta group_tabs
 */
export async function executeGroupTabs(toolCall: ToolCall): Promise<ToolResult & { groupId?: number }> {
  const args = JSON.parse(toolCall.function.arguments);
  const { groupTitle, tabIds } = args;
  
  try {
    // Obtener todas las pestañas abiertas del navegador
    const allTabs = await chrome.tabs.query({});
    
    // Verificar que las pestañas solicitadas existan
    const tabsToGroup = allTabs.filter(tab => tabIds.includes(tab.id!));
    
    if (tabsToGroup.length === 0) {
      return {
        tool_call_id: toolCall.id,
        functionName: toolCall.function.name,
        content: `❌ No se encontraron pestañas válidas para agrupar. IDs solicitados: ${tabIds.join(', ')}. IDs disponibles: ${allTabs.map(t => t.id).join(', ')}`,
        success: false
      };
    }
    
    if (tabsToGroup.length !== tabIds.length) {
      const missingIds = tabIds.filter((id: number) => !tabsToGroup.find(t => t.id === id));
      console.log('⚠️ Algunas pestañas no se encontraron:', {
        requested: tabIds,
        found: tabsToGroup.map(t => t.id),
        missing: missingIds
      });
      
      return {
        tool_call_id: toolCall.id,
        functionName: toolCall.function.name,
        content: `⚠️ Algunas pestañas no se encontraron. IDs faltantes: ${missingIds.join(', ')}. Continuando con las pestañas disponibles.`,
        success: false
      };
    }
    
    // Crear el grupo de pestañas usando la API correcta
    // Primero mover las pestañas a una posición específica para crear el grupo
    const groupId = await chrome.tabs.group({
      tabIds: tabsToGroup.map(t => t.id!)
    });
    
    // Establecer el título del grupo
    await chrome.tabGroups.update(groupId, {
      title: groupTitle,
      color: 'blue' // Color por defecto, se puede personalizar
    });
    
    console.log("Grupo de pestañas creado:", groupId);
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `✅ Grupo de pestañas creado exitosamente!\n\n**Detalles del grupo:**\n- Título: "${groupTitle}"\n- ID del grupo: ${groupId}\n- Pestañas agrupadas: ${tabsToGroup.length}\n- Pestañas: ${tabsToGroup.map(t => `"${t.title}" (ID: ${t.id})`).join(', ')}`,
      success: true,
      groupId: groupId
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al agrupar pestañas:', error);
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `❌ Error al agrupar pestañas: ${errorMessage}`,
      success: false
    };
  }
}

/**
 * Espera a que una página esté completamente cargada
 * @param tabId - ID de la pestaña
 */
async function waitForPageLoad(tabId: number): Promise<void> {
  try {
    // Esperar a que la pestaña esté completamente cargada
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout esperando carga de página'));
      }, 30000); // 30 segundos de timeout
      
      const checkPageLoad = async () => {
        try {
          const tab = await chrome.tabs.get(tabId);
          
          // Verificar si la página está completamente cargada
          if (tab.status === 'complete') {
            clearTimeout(timeout);
            
            // Esperar un poco más para asegurar que el DOM esté listo
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Verificar que el DOM esté realmente listo
            const domReady = await chrome.scripting.executeScript({
              target: { tabId },
              func: () => {
                return new Promise<boolean>((resolve) => {
                  if (document.readyState === 'complete') {
                    resolve(true);
                  } else {
                    const handleLoad = () => {
                      document.removeEventListener('load', handleLoad);
                      resolve(true);
                    };
                    document.addEventListener('load', handleLoad);
                  }
                });
              }
            });
            
            if (domReady[0]?.result) {
              resolve();
            } else {
              reject(new Error('DOM no está listo'));
            }
          } else {
            // Reintentar en 500ms
            setTimeout(checkPageLoad, 500);
          }
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      };
      
      checkPageLoad();
    });
    
    console.log(`✅ Pestaña ${tabId} completamente cargada y lista`);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`❌ Error esperando carga de pestaña ${tabId}:`, error);
    throw new Error(`Error esperando carga de página: ${errorMessage}`);
  }
}

/**
 * Ejecuta la herramienta list_all_tabs
 */
export async function executeListAllTabs(toolCall: ToolCall): Promise<ToolResult & { totalTabs?: number }> {
  // const args = JSON.parse(toolCall.function.arguments);
  // const { reason } = args; // No se usa actualmente
  
  try {
    // Obtener todas las pestañas abiertas del navegador
    const allTabs = await chrome.tabs.query({});
    
    // Formatear la información de las pestañas
    const tabsInfo = allTabs.map(tab => {
      const status = tab.status === 'complete' ? '✅' : '⏳';
      const active = tab.active ? '🔥' : '';
      const pinned = tab.pinned ? '📌' : '';
      
      return `${status} ${active}${pinned} **ID ${tab.id}**: "${tab.title}" (${tab.url})`;
    }).join('\n');
    
    console.log("Lista de todas las pestañas:", allTabs);
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `📋 **Todas las pestañas abiertas** (${allTabs.length} total):\n\n${tabsInfo}\n\n**Leyenda:**\n- ✅ Pestaña cargada completamente\n- ⏳ Pestaña cargando\n- 🔥 Pestaña activa actualmente\n- 📌 Pestaña fijada`,
      success: true,
      totalTabs: allTabs.length
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al listar pestañas:', error);
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `❌ Error al listar pestañas: ${errorMessage}`,
      success: false
    };
  }
}
