# Configuración de Google Gemini API

## Variable de Entorno

La API Key de Google Gemini ha sido configurada en el código como fallback, pero es **altamente recomendable** usar una variable de entorno por seguridad.

### Opción 1: Archivo .env.local (Recomendado)

Crea un archivo `.env.local` en la raíz del proyecto con:

```
GEMINI_API_KEY=AIzaSyCjKEqAMTi7ADNGuum2EH-QtNcnt-zTwc0
```

**Nota:** Este archivo está en `.gitignore` y no se subirá al repositorio por seguridad.

### Opción 2: Usar la clave directamente en el código

Ya está configurado como fallback en ambos archivos:
- `app/api/recommendations/route.ts`
- `app/api/allocation/route.ts`

## Modelo Utilizado

Se está usando **Gemini 2.5 Flash** (`gemini-2.5-flash`), que es uno de los modelos más rápidos y eficientes de Google.

## Configuración

- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
- **Método**: POST
- **Response MIME Type**: `application/json` (para garantizar respuestas en formato JSON)
- **Temperature**: 0.7
- **Max Output Tokens**: 8192

## Fallback Automático

Si la API de Gemini falla por cualquier motivo (error de red, límite de tasa, etc.), el sistema automáticamente usará datos de ejemplo (mock data) para que la aplicación siga funcionando.

## Verificación

Para verificar que todo funciona:

1. Reinicia el servidor de desarrollo: `npm run dev`
2. Completa el formulario de inversión
3. Revisa la consola del servidor para ver si hay errores de API
4. Si todo funciona correctamente, verás recomendaciones generadas por Gemini

## Troubleshooting

Si ves errores:

1. **Error 401**: Verifica que la API Key sea correcta y que tengas habilitada la API de Gemini en Google Cloud Console
2. **Error 429**: Has alcanzado el límite de rate. Espera unos minutos o verifica tu cuota en Google Cloud Console
3. **Error de parsing JSON**: El formato de respuesta puede variar. Revisa los logs en la consola
4. **Error 400**: Verifica que el modelo `gemini-2.5-flash` esté disponible en tu región/proyecto

## Obtener una API Key de Gemini

Si necesitas obtener o renovar tu API key:

1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Crea una nueva API key o usa una existente
4. Copia la clave y úsala en la variable de entorno o directamente en el código

