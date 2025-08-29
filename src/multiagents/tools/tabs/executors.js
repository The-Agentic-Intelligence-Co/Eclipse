/**
 * Ejecutores de herramientas de pestañas
 */

import { extractTabContent, extractMultipleTabsContent } from './extractor.js';

/**
 * Ejecuta la herramienta extract_tab_content
 */
export async function executeExtractTabContent(toolCall, selectedTabs) {
  const args = JSON.parse(toolCall.function.arguments);
  const { tabId, reason } = args;
  
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
export async function executeExtractMultipleTabsContent(toolCall, selectedTabs) {
  const args = JSON.parse(toolCall.function.arguments);
  const { reason } = args;
  
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
export async function executeOpenTabWithUrl(toolCall) {
  const args = JSON.parse(toolCall.function.arguments);
  const { url, reason } = args;
  
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
    
    console.log("Nueva pestaña creada:", newTab);
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `✅ Nueva pestaña abierta exitosamente con la URL: ${normalizedUrl}\n\n**Detalles de la pestaña:**\n- ID: ${newTab.id}\n- Título: ${newTab.title || 'Cargando...'}\n- URL: ${newTab.url || normalizedUrl}`,
      success: true,
      newTab: newTab
    };
  } catch (error) {
    console.error('Error al abrir nueva pestaña:', error);
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `❌ Error al abrir nueva pestaña: ${error.message}`,
      success: false
    };
  }
}

/**
 * Ejecuta la herramienta group_tabs
 */
export async function executeGroupTabs(toolCall) {
  const args = JSON.parse(toolCall.function.arguments);
  const { groupTitle, tabIds, reason } = args;
  
  try {
    // Obtener todas las pestañas abiertas del navegador
    const allTabs = await chrome.tabs.query({});
    
    // Verificar que las pestañas solicitadas existan
    const tabsToGroup = allTabs.filter(tab => tabIds.includes(tab.id));
    
    if (tabsToGroup.length === 0) {
      return {
        tool_call_id: toolCall.id,
        functionName: toolCall.function.name,
        content: `❌ No se encontraron pestañas válidas para agrupar. IDs solicitados: ${tabIds.join(', ')}. IDs disponibles: ${allTabs.map(t => t.id).join(', ')}`,
        success: false
      };
    }
    
    if (tabsToGroup.length !== tabIds.length) {
      const missingIds = tabIds.filter(id => !tabsToGroup.find(t => t.id === id));
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
    
    // Crear el grupo de pestañas
    const groupId = await chrome.tabGroups.create({
      tabIds: tabsToGroup.map(t => t.id)
    });
    
    // Establecer el título del grupo
    await chrome.tabGroups.update(groupId.id, {
      title: groupTitle,
      color: 'blue' // Color por defecto, se puede personalizar
    });
    
    console.log("Grupo de pestañas creado:", groupId);
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `✅ Grupo de pestañas creado exitosamente!\n\n**Detalles del grupo:**\n- Título: "${groupTitle}"\n- ID del grupo: ${groupId.id}\n- Pestañas agrupadas: ${tabsToGroup.length}\n- Pestañas: ${tabsToGroup.map(t => `"${t.title}" (ID: ${t.id})`).join(', ')}`,
      success: true,
      groupId: groupId.id
    };
  } catch (error) {
    console.error('Error al agrupar pestañas:', error);
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `❌ Error al agrupar pestañas: ${error.message}`,
      success: false
    };
  }
}

/**
 * Ejecuta la herramienta list_all_tabs
 */
export async function executeListAllTabs(toolCall) {
  const args = JSON.parse(toolCall.function.arguments);
  const { reason } = args;
  
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
    console.error('Error al listar pestañas:', error);
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `❌ Error al listar pestañas: ${error.message}`,
      success: false
    };
  }
}
