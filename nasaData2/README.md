# 🚀 NASA Space Habitat Builder

Una aplicación web interactiva construida con Three.js que permite cargar y posicionar modelos 3D para construir habitats espaciales.

## ✨ Características

- **Carga de modelos 3D**: Soporte completo para archivos OBJ y MTL
- **Interfaz intuitiva**: Panel de control fácil de usar
- **Navegación 3D**: Controles de cámara suaves y responsivos
- **Selección de objetos**: Click para seleccionar y manipular objetos
- **Ambiente espacial**: Iluminación realista y campo de estrellas
- **Gestión de objetos**: Lista de objetos cargados con controles individuales

## 🎮 Controles

### Navegación
- **Arrastrar mouse**: Rotar cámara alrededor del origen
- **Rueda del mouse**: Zoom in/out
- **WASD**: Mover cámara horizontalmente
- **Q/E**: Subir/bajar cámara
- **Click izquierdo**: Seleccionar objeto

### Gestión de objetos
- **Delete**: Eliminar objeto seleccionado
- **Panel UI**: Cargar nuevos modelos y gestionar objetos existentes

## 🚀 Cómo usar

1. **Abrir la aplicación**: Simplemente abre `index.html` en tu navegador
2. **Cargar modelos**: 
   - Selecciona un archivo .obj
   - Opcionalmente selecciona un archivo .mtl para materiales
   - Haz click en "Cargar Modelo"
3. **Construir tu habitat**:
   - Los objetos aparecerán en el centro de la escena
   - Usa los controles de cámara para navegar
   - Click en objetos para seleccionarlos
   - Usa la lista de objetos para gestionar múltiples modelos

## 📁 Estructura de archivos

```
nasaData2/
├── index.html          # Página principal
├── app.js             # Lógica de la aplicación
├── models/            # Directorio para modelos 3D
│   ├── garden.obj     # Modelo de ejemplo
│   └── garden.mtl     # Material de ejemplo
└── README.md          # Este archivo
```

## 🛠️ Tecnologías utilizadas

- **Three.js**: Motor de gráficos 3D
- **OBJLoader**: Cargador de modelos OBJ
- **MTLLoader**: Cargador de materiales MTL
- **OrbitControls**: Controles de cámara
- **HTML5/CSS3/JavaScript**: Interfaz web

## 📋 Formatos soportados

- **OBJ**: Archivos de geometría 3D
- **MTL**: Archivos de materiales (opcional)
- **Texturas**: JPG, PNG (referenciadas en archivos MTL)

## 🎨 Personalización

La aplicación está diseñada para ser fácilmente personalizable:

- **Colores**: Modifica las variables CSS en `index.html`
- **Iluminación**: Ajusta los parámetros de luz en `app.js`
- **Controles**: Añade nuevos controles de teclado en `onKeyDown()`
- **Funcionalidades**: Extiende la clase `SpaceHabitatBuilder`

## 🔧 Requisitos

- Navegador web moderno con soporte para WebGL
- Servidor web local (recomendado para cargar archivos)
- Archivos de modelo en formato OBJ/MTL

## 🚀 Ejecutar con servidor local

Para evitar problemas de CORS al cargar archivos, es recomendable usar un servidor local:

```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (si tienes http-server instalado)
npx http-server

# Con PHP
php -S localhost:8000
```

Luego abre `http://localhost:8000` en tu navegador.

## 📝 Notas

- Los modelos se cargan en el centro de la escena (0,0,0)
- Los objetos seleccionados muestran un borde azul
- La aplicación incluye un modelo de ejemplo (garden.obj/mtl)
- El grid de referencia ayuda a posicionar objetos
- Las sombras están habilitadas para mayor realismo

¡Disfruta construyendo tu habitat espacial! 🌌

