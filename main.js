document.addEventListener('DOMContentLoaded', function() {
    if (typeof THREE === 'undefined') {
        console.error('THREE не загружен!');
        return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });

    // Настройка рендерера для уменьшения контрастности
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding; // Улучшение цветового пространства
    renderer.toneMapping = THREE.LinearToneMapping; // Линейное тональное отображение
    renderer.toneMappingExposure = 1.0; // Экспозиция, можно попробовать уменьшить до 0.8 или ниже
    renderer.gammaFactor = 2.2; // Настройка гаммы

    document.getElementById('three-container').appendChild(renderer.domElement);

    camera.position.z = 20;

    // Уменьшаем интенсивность общего освещения
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Добавляем мягкий направленный свет
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Добавляем мягкий обратный свет
    const backLight = new THREE.DirectionalLight(0xffffff, 0.1);
    backLight.position.set(-5, -5, -5);
    scene.add(backLight);

    let model;
    const loader = new THREE.GLTFLoader();
    console.log('Начинаем загрузку модели...');

    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    // Функция для настройки размера и позиции модели
    function updateModelForScreenSize() {
        if (!model) return;

        const screenWidth = window.innerWidth;

        if (screenWidth <= 480) {  // Мобильные
            model.scale.set(1.2, 1.2, 1.2);
            camera.position.z = 20;
        } else if (screenWidth <= 768) {  // Планшеты
            model.scale.set(1.5, 1.5, 1.5);
            camera.position.z = 18;
        } else if (screenWidth <= 1024) {  // Маленькие ноутбуки
            model.scale.set(1.8, 1.8, 1.8);
            camera.position.z = 16;
        } else {  // Большие экраны
            model.scale.set(2, 2, 2);
            camera.position.z = 15;
        }
    }

    // Обновляем обработчик изменения размера окна
    window.addEventListener('resize', () => {
        // Обновляем камеру
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Обновляем модель
        updateModelForScreenSize();
    });

    // Начальная загрузка модели
    loader.load(
        './models/source/model2.gltf',
        function (gltf) {
            console.log('Модель успешно загружена!');
            model = gltf.scene;

            model.traverse((node) => {
                if (node.isMesh) {
                    const map = node.material.map;
                    node.material = new THREE.MeshStandardMaterial({
                        map: map,
                        emissive: node.material.color,
                        emissiveMap: map,
                        emissiveIntensity: 0.1,
                        roughness: 0.5,
                        metalness: 0.1
                    });
                }
            });

            scene.add(model);
            
            // Применяем начальные настройки размера
            updateModelForScreenSize();
            
            // Обновляем чувствительность мыши для разных экранов
            document.addEventListener('mousemove', (event) => {
                const sensitivity = window.innerWidth <= 768 ? 150 : 100; // Меньшая чувствительность для мобильных
                mouseX = Math.max(-1, Math.min(1, (event.clientX - window.innerWidth / 2) / sensitivity));
                mouseY = Math.max(-0.5, Math.min(0.5, (event.clientY - window.innerHeight / 2) / sensitivity));
            });

            function animate() {
                requestAnimationFrame(animate);

                if (model) {
                    targetRotationY = mouseX;
                    targetRotationX = mouseY;
                    
                    // Уменьшаем скорость вращения на мобильных
                    const rotationSpeed = window.innerWidth <= 768 ? 0.03 : 0.05;
                    
                    model.rotation.y += (targetRotationY - model.rotation.y) * rotationSpeed;
                    model.rotation.x += (targetRotationX - model.rotation.x) * rotationSpeed;
                    
                    model.rotation.x = Math.max(-0.5, Math.min(0.5, model.rotation.x));
                    model.rotation.y = Math.max(-1, Math.min(1, model.rotation.y));
                }
                
                renderer.render(scene, camera);
            }
            animate();
        },
        function (progress) {
            console.log('Загрузка: ', (progress.loaded / progress.total * 100) + '%');
        },
        function (error) {
            console.error('Ошибка при загрузке:', error);
        }
    );
});