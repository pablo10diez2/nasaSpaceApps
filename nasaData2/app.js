class SpaceHabitatBuilder {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.objects = [];
        this.selectedObject = null;
        this.isDragging = false;
        this.objLoader = new THREE.OBJLoader();
        this.mtlLoader = new THREE.MTLLoader();
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        // Crear escena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        
        // Crear cámara
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(10, 10, 10);
        
        // Crear renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;
        
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
        
        // Crear controles de órbita
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        this.controls.maxPolarAngle = Math.PI / 2;
        
        // Configurar iluminación espacial
        this.setupLighting();
        
        // Crear grid de referencia
        this.createGrid();
        
        // Cargar modelo de ejemplo si existe
        this.loadExampleModel();
    }

    setupLighting() {
        // Luz ambiental suave
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Luz direccional principal (simula el sol)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        this.scene.add(directionalLight);
        
        // Luz puntual adicional para iluminar el área de construcción
        const pointLight = new THREE.PointLight(0x00d4ff, 0.5, 100);
        pointLight.position.set(0, 20, 0);
        pointLight.castShadow = true;
        this.scene.add(pointLight);
        
        // Efecto de estrellas en el fondo
        this.createStarField();
    }

    createStarField() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 1000;
        const positions = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 2000;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2,
            transparent: true,
            opacity: 0.8
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }

    createGrid() {
        const gridHelper = new THREE.GridHelper(100, 100, 0x444444, 0x222222);
        gridHelper.position.y = -0.1;
        this.scene.add(gridHelper);
        
        // Crear plano invisible para detectar clicks
        const planeGeometry = new THREE.PlaneGeometry(200, 200);
        const planeMaterial = new THREE.MeshBasicMaterial({ 
            visible: false, 
            side: THREE.DoubleSide 
        });
        this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.plane.rotation.x = -Math.PI / 2;
        this.scene.add(this.plane);
    }

    async loadExampleModel() {
        try {
            // Intentar cargar el modelo de ejemplo
            const objPath = './models/garden.obj';
            const mtlPath = './models/garden.mtl';
            
            // Verificar si los archivos existen
            const response = await fetch(objPath, { method: 'HEAD' });
            if (response.ok) {
                await this.loadModelFromFiles(mtlPath, objPath, 'Garden Example');
            }
        } catch (error) {
            console.log('No se encontró modelo de ejemplo, continuando...');
        }
    }

    async loadModelFromFiles(mtlPath, objPath, name) {
        this.showLoading(true);
        
        try {
            let material = null;
            
            // Cargar material si existe
            if (mtlPath) {
                material = await new Promise((resolve, reject) => {
                    this.mtlLoader.load(
                        mtlPath,
                        (materials) => {
                            materials.preload();
                            resolve(materials);
                        },
                        undefined,
                        reject
                    );
                });
            }
            
            // Cargar modelo OBJ
            const object = await new Promise((resolve, reject) => {
                if (material) {
                    this.objLoader.setMaterials(material);
                }
                
                this.objLoader.load(
                    objPath,
                    (obj) => {
                        resolve(obj);
                    },
                    undefined,
                    reject
                );
            });
            
            // Configurar el objeto
            object.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            // Posicionar el objeto
            object.position.set(0, 0, 0);
            object.scale.set(1, 1, 1);
            object.userData = { 
                name: name || 'Modelo 3D',
                id: Date.now(),
                originalScale: object.scale.clone()
            };
            
            // Añadir borde de selección
            this.addSelectionBorder(object);
            
            this.scene.add(object);
            this.objects.push(object);
            this.updateObjectList();
            
            console.log('Modelo cargado exitosamente:', name);
            
        } catch (error) {
            console.error('Error cargando modelo:', error);
            alert('Error cargando el modelo: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    addSelectionBorder(object) {
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        const geometry = new THREE.BoxGeometry(size.x + 0.2, size.y + 0.2, size.z + 0.2);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00d4ff,
            wireframe: true,
            transparent: true,
            opacity: 0.5
        });
        
        const border = new THREE.Mesh(geometry, material);
        border.position.copy(center);
        border.visible = false;
        border.userData = { isBorder: true, parentObject: object };
        
        object.userData.border = border;
        this.scene.add(border);
    }

    setupEventListeners() {
        // Controles de archivos
        document.getElementById('load-model').addEventListener('click', () => {
            this.loadModelFromUI();
        });
        
        document.getElementById('clear-all').addEventListener('click', () => {
            this.clearAllObjects();
        });
        
        // Controles de mouse
        this.renderer.domElement.addEventListener('click', (event) => {
            this.onMouseClick(event);
        });
        
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            this.onMouseMove(event);
        });
        
        this.renderer.domElement.addEventListener('mousedown', (event) => {
            this.isDragging = true;
        });
        
        this.renderer.domElement.addEventListener('mouseup', (event) => {
            this.isDragging = false;
        });
        
        // Controles de teclado
        document.addEventListener('keydown', (event) => {
            this.onKeyDown(event);
        });
        
        // Redimensionar ventana
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });
    }

    async loadModelFromUI() {
        const objFile = document.getElementById('obj-file').files[0];
        const mtlFile = document.getElementById('mtl-file').files[0];
        
        if (!objFile) {
            alert('Por favor selecciona un archivo .obj');
            return;
        }
        
        const objUrl = URL.createObjectURL(objFile);
        const mtlUrl = mtlFile ? URL.createObjectURL(mtlFile) : null;
        
        try {
            await this.loadModelFromFiles(mtlUrl, objUrl, objFile.name);
        } finally {
            URL.revokeObjectURL(objUrl);
            if (mtlUrl) URL.revokeObjectURL(mtlUrl);
        }
    }

    onMouseClick(event) {
        if (this.isDragging) return;
        
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Detectar intersecciones con objetos
        const intersects = this.raycaster.intersectObjects(
            this.objects.filter(obj => !obj.userData.border)
        );
        
        if (intersects.length > 0) {
            this.selectObject(intersects[0].object);
        } else {
            this.deselectAll();
        }
    }

    onMouseMove(event) {
        if (!this.isDragging) return;
        
        // Aquí se puede implementar lógica de arrastre de objetos
        // Por ahora solo actualizamos la posición del mouse
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onKeyDown(event) {
        const moveSpeed = 1;
        
        switch(event.code) {
            case 'KeyW':
                this.camera.position.z -= moveSpeed;
                break;
            case 'KeyS':
                this.camera.position.z += moveSpeed;
                break;
            case 'KeyA':
                this.camera.position.x -= moveSpeed;
                break;
            case 'KeyD':
                this.camera.position.x += moveSpeed;
                break;
            case 'KeyQ':
                this.camera.position.y += moveSpeed;
                break;
            case 'KeyE':
                this.camera.position.y -= moveSpeed;
                break;
            case 'Delete':
                if (this.selectedObject) {
                    this.deleteObject(this.selectedObject);
                }
                break;
        }
        
        this.controls.update();
    }

    selectObject(object) {
        this.deselectAll();
        
        this.selectedObject = object;
        if (object.userData.border) {
            object.userData.border.visible = true;
        }
        
        console.log('Objeto seleccionado:', object.userData.name);
    }

    deselectAll() {
        if (this.selectedObject && this.selectedObject.userData.border) {
            this.selectedObject.userData.border.visible = false;
        }
        this.selectedObject = null;
    }

    deleteObject(object) {
        const index = this.objects.indexOf(object);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
        
        if (object.userData.border) {
            this.scene.remove(object.userData.border);
        }
        
        this.scene.remove(object);
        this.updateObjectList();
        
        if (this.selectedObject === object) {
            this.selectedObject = null;
        }
    }

    clearAllObjects() {
        this.objects.forEach(obj => {
            if (obj.userData.border) {
                this.scene.remove(obj.userData.border);
            }
            this.scene.remove(obj);
        });
        
        this.objects = [];
        this.selectedObject = null;
        this.updateObjectList();
    }

    updateObjectList() {
        const listContainer = document.getElementById('object-list');
        
        if (this.objects.length === 0) {
            listContainer.innerHTML = '<div style="color: #666; text-align: center; padding: 10px;">No hay objetos cargados</div>';
            return;
        }
        
        listContainer.innerHTML = this.objects.map(obj => `
            <div class="object-item">
                <span class="object-name">${obj.userData.name}</span>
                <div class="object-controls">
                    <button class="btn btn-small" onclick="app.selectObjectFromList('${obj.userData.id}')">Seleccionar</button>
                    <button class="btn btn-small danger" onclick="app.deleteObjectFromList('${obj.userData.id}')">Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    selectObjectFromList(id) {
        const object = this.objects.find(obj => obj.userData.id == id);
        if (object) {
            this.selectObject(object);
        }
    }

    deleteObjectFromList(id) {
        const object = this.objects.find(obj => obj.userData.id == id);
        if (object) {
            this.deleteObject(object);
        }
    }

    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'block' : 'none';
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Inicializar la aplicación cuando se carga la página
let app;
window.addEventListener('DOMContentLoaded', () => {
    app = new SpaceHabitatBuilder();
});

