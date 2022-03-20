import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'

export default function go() {
    const scene = new THREE.Scene()
    scene.add(new THREE.AxesHelper(5))

    const light = new THREE.DirectionalLight(0xffffff, 2)
    light.position.set(5, 0, 3)
    light.lookAt(scene.position)
    light.castShadow = true

    //Set up shadow properties for the light
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    light.shadow.camera.near = 15;     // default
    light.shadow.camera.far = 50;      // default

    scene.add(light)

    const _size = 500
    const width = window.innerWidth / _size
    const height = window.innerHeight / _size

    const camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 1000);
    const a = 100
    camera.position.y = -a
    camera.position.z = a * Math.sqrt(3)

    const renderer = new THREE.WebGLRenderer()
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // renderer.shadowMap.type = THREE.BasicShadowMap;

    renderer.setSize(window.innerWidth, window.innerHeight)

    document.body.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.screenSpacePanning = true //so that panning up and down doesn't zoom in/out
    //controls.addEventListener('change', render)

    const planeGeometry = new THREE.PlaneGeometry(3.84, 2.16, 384, 216)

    const sz = 1.0
    planeGeometry.scale(sz, sz, sz)

    const material = new THREE.MeshPhongMaterial()
    const texture = new THREE.TextureLoader().load('./color.png')
    material.map = texture

    const displacementMap = new THREE.TextureLoader().load('./height.png')
    material.displacementMap = displacementMap

    const plane: THREE.Mesh = new THREE.Mesh(planeGeometry, material)
    plane.castShadow = true
    plane.receiveShadow = true

    // plane.position.z = -1

    scene.add(plane)

    window.addEventListener('resize', onWindowResize, false)
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        render()
    }

    const stats = Stats()
    document.body.appendChild(stats.dom)

    const options = {
        side: {
            FrontSide: THREE.FrontSide,
            BackSide: THREE.BackSide,
            DoubleSide: THREE.DoubleSide,
        },
    }
    const gui = new GUI()
    gui.width = 400

    // const materialFolder = gui.addFolder('THREE.Material')
    // materialFolder.add(material, 'transparent').onChange(() => material.needsUpdate = true)
    // materialFolder.add(material, 'opacity', 0, 1, 0.01)
    // materialFolder.add(material, 'depthTest')
    // materialFolder.add(material, 'depthWrite')
    // materialFolder
    //     .add(material, 'alphaTest', 0, 1, 0.01)
    //     .onChange(() => updateMaterial())
    // materialFolder.add(material, 'visible')
    // materialFolder
    //     .add(material, 'side', options.side)
    //     .onChange(() => updateMaterial())
    // //materialFolder.open()

    const data = {
        color: material.color.getHex(),
        emissive: material.emissive.getHex(),
        specular: material.specular.getHex(),
    }

    // const meshPhongMaterialFolder = gui.addFolder('THREE.meshPhongMaterialFolder')

    // meshPhongMaterialFolder.addColor(data, 'color').onChange(() => {
    //     material.color.setHex(Number(data.color.toString().replace('#', '0x')))
    // })
    // meshPhongMaterialFolder.addColor(data, 'emissive').onChange(() => {
    //     material.emissive.setHex(
    //         Number(data.emissive.toString().replace('#', '0x'))
    //     )
    // })
    // meshPhongMaterialFolder.addColor(data, 'specular').onChange(() => {
    //     material.specular.setHex(
    //         Number(data.specular.toString().replace('#', '0x'))
    //     )
    // })
    // meshPhongMaterialFolder.add(material, 'shininess', 0, 1024)
    // meshPhongMaterialFolder.add(material, 'wireframe')
    // meshPhongMaterialFolder
    //     .add(material, 'flatShading')
    //     .onChange(() => updateMaterial())
    // meshPhongMaterialFolder.add(material, 'reflectivity', 0, 1)
    // meshPhongMaterialFolder.add(material, 'refractionRatio', 0, 1)

    // meshPhongMaterialFolder.add(material, 'displacementBias', -1, 1, 0.01)
    // meshPhongMaterialFolder.open()

    // function updateMaterial() {
    //     material.side = Number(material.side)
    //     material.needsUpdate = true
    // }

    const planeData = {
        width: 3.6,
        height: 1.8,
        widthSegments: 360,
        heightSegments: 180,
    }

    // const planePropertiesFolder = gui.addFolder('PlaneGeometry')
    // //planePropertiesFolder.add(planeData, 'width', 1, 30).onChange(regeneratePlaneGeometry)
    // //planePropertiesFolder.add(planeData, 'height', 1, 30).onChange(regeneratePlaneGeometry)
    // planePropertiesFolder
    //     .add(planeData, 'widthSegments', 1, 360 * 3)
    //     .onChange(regeneratePlaneGeometry)
    // planePropertiesFolder
    //     .add(planeData, 'heightSegments', 1, 180 * 3)
    //     .onChange(regeneratePlaneGeometry)
    // // planePropertiesFolder.open()

    const sunData = {
        sunRotation: Math.PI,
        sunHeight: 10
    }


    const sunFolder = gui.addFolder('Settings')
    //planePropertiesFolder.add(planeData, 'width', 1, 30).onChange(regeneratePlaneGeometry)
    //planePropertiesFolder.add(planeData, 'height', 1, 30).onChange(regeneratePlaneGeometry)
    sunFolder
        .add(sunData, 'sunRotation', 0, Math.PI * 2.0)
    // .onChange(regeneratePlaneGeometry)
    sunFolder
        .add(sunData, 'sunHeight', 1, 40)
    // .onChange(regeneratePlaneGeometry)

    sunFolder.add(material, 'displacementScale', 0, 4, 0.01)

    sunFolder.open()


    /////////////////////////////////////////
    function regeneratePlaneGeometry() {
        const newGeometry = new THREE.PlaneGeometry(
            planeData.width,
            planeData.height,
            planeData.widthSegments,
            planeData.heightSegments
        )
        plane.geometry.dispose()
        plane.geometry = newGeometry
    }

    function animate() {
        requestAnimationFrame(animate)

        render()

        stats.update()
    }

    function render() {
        const m = 0.001
        const r = 20
        light.position.set(
            r * Math.sin(sunData.sunRotation),
            r * Math.cos(sunData.sunRotation),
            sunData.sunHeight,
        )
        light.lookAt(scene.position)
        renderer.render(scene, camera)
    }

    animate()
}
