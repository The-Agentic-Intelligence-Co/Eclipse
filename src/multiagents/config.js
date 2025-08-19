// Configuración centralizada para el motor de IA y depuración

export const CONFIG = {
	MODEL: "openai/gpt-oss-120b",
	MAX_COMPLETION_TOKENS: 8192,
	TEMPERATURE: 1,
	REASONING_EFFORT: "medium",
	// Activar logs detallados en desarrollo
	DEBUG: typeof import.meta !== 'undefined' ? import.meta.env?.MODE !== 'production' : true,
};


