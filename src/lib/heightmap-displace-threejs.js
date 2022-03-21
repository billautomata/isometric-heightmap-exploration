import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'
import * as PIXI from 'pixi.js'

export default function go(opts) {

    console.log(opts)
    const scene = new THREE.Scene()
    scene.add(new THREE.AxesHelper(5))

    const baseObj = new THREE.Object3D()
    scene.add(baseObj)

    const light = new THREE.DirectionalLight(0xffffff, 2)
    light.position.set(0, 3, 3)
    light.lookAt(baseObj.position)
    light.castShadow = true
    // baseObj.add(light)

    const lamp = new THREE.AmbientLight(0xFFFFFF, 1)
    scene.add(lamp)

    //Set up shadow properties for the light
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    light.shadow.camera.near = 1;     // default
    light.shadow.camera.far = 500;      // default

    const width = 5.5
    const height = width

    const camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 0.01, 1000);
    const a = 1
    camera.position.x = a
    camera.position.z = a * Math.sqrt(3)

    const renderer = new THREE.WebGLRenderer()
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // renderer.shadowMap.type = THREE.BasicShadowMap;

    renderer.setSize(512, 512)

    document.querySelector('.three-displace-step').appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    // controls.screenSpacePanning = true //so that panning up and down doesn't zoom in/out
    // controls.addEventListener('change', render)

    const planeGeometry = new THREE.PlaneGeometry(5.12, 5.12, 320, 320)

    const sz = 1.0
    planeGeometry.scale(sz, sz, sz)

    // baseObj.rotateX(-1 * (30.0 * (Math.PI / 180.0)) - Math.PI)
    // planeGeometry.rotateZ(-30 * (Math.PI/180))

    // camera.position.x = -a

    const pixiStep1Canvas = document.querySelector('.pixi-step-1').querySelector('canvas')

    console.log(pixiStep1Canvas)

    const material = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide })
    const texture = new THREE.TextureLoader().load(`./isometric-heightmap-exploration/infiniworld/output/${opts.chunkURL}.png`)
    material.map = texture

    material.displacementScale = 1

    console.log(pixiStep1Canvas)
    const ctx = pixiStep1Canvas.getContext('webgl2')
    console.log('ctx', ctx)

    setTimeout(() => {
        const tex = new THREE.DataTexture(opts.pixels, 512, 512)
        tex.needsUpdate = true
        material.map = tex
    }, 300)

    const displacementMap = new THREE.TextureLoader().load(`./isometric-heightmap-exploration/infiniworld/output/${opts.chunkURL}.png`)
    material.displacementMap = displacementMap

    const plane = new THREE.Mesh(planeGeometry, material)
    plane.castShadow = true
    plane.receiveShadow = true

    // plane.rotateX(Math.PI)

    // plane.position.z = -1

    baseObj.add(plane)

    const stats = Stats()
    // document.querySelector('.App').appendChild(stats.dom)

    const options = {
        side: {
            FrontSide: THREE.FrontSide,
            BackSide: THREE.BackSide,
            DoubleSide: THREE.DoubleSide,
        },
    }
    const gui = new GUI()
    gui.width = 400
    gui.hide()

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
        // const r = 20
        // light.position.set(
        //     r * Math.sin(sunData.sunRotation),
        //     r * Math.cos(sunData.sunRotation),
        //     sunData.sunHeight,
        // )
        // viking.position.set(0.1, 0, 0.55 * material.displacementScale + 0.03)
        // viking.lookAt(camera.position)
        // light.lookAt(scene.position)
        renderer.render(scene, camera)
    }

    animate()
}
