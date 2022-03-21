import * as PIXI from 'pixi.js'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'
import * as async from 'async'


PIXI.settings.WRAP_MODE = PIXI.WRAP_MODES.REPEAT

const range = 48
const cameraDistance = 300
const chunkSize = 512
const meshSize = 10
const meshVerts = 32
const displacementScale = 10

export default function allSteps() {

    PIXI.Loader.shared.add('texture_id_assign_frag', `./isometric-heightmap-exploration/textureIdAssign.frag`)

    const appStep1 = new PIXI.Application({
        width: chunkSize,
        height: chunkSize,
        backgroundColor: 0xFFFF00,
        resolution: 1
    })

    document.querySelector('.pixi-step-1').appendChild(appStep1.view)

    // threejs section
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
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.shadow.camera.near = 1;     // default
    light.shadow.camera.far = 500;      // default

    const width = (range+2) * meshSize
    const height = width

    const camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 0.001, 1000);
    const a = cameraDistance
    camera.position.y = -a
    camera.position.z = a * Math.sqrt(3)

    const renderer = new THREE.WebGLRenderer()
    // renderer.WRAP_MODE
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // renderer.shadowMap.type = THREE.BasicShadowMap;

    renderer.setSize(window.innerWidth, window.innerHeight)

    document.querySelector('.three-displace-step').appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    // controls.screenSpacePanning = true //so that panning up and down doesn't zoom in/out
    controls.addEventListener('change', () => { renderer.render(scene, camera) })

    const spawnPoint = { x: 33263, y: 33986 }
    const position = { x: spawnPoint.x, y: spawnPoint.y }
    // const position = { x: 64 * chunkSize, y: 64 * chunkSize }

    const fns = []
    for (let x = 0; x < range; ++x) {
        for (let y = 0; y < range; ++y) {
            fns.push((done) => {
                generateChunk(position, { x: x - Math.round(range / 2), y: y - Math.round(range / 2) }, done)
            })
        }
    }

    async.series(fns)

    function generateChunk(pos, chunkOffset, callback) {
        document.querySelector('.pixi-step-1').style.display = 'block'
        const chunk = { x: Math.floor(position.x / chunkSize), y: Math.floor(position.y / chunkSize) }
        chunk.x += chunkOffset.x
        chunk.y += chunkOffset.y
        const chunkURL = `chunk_${String(chunk.x).padStart(4, '0')}_${String(chunk.y).padStart(4, '0')}`

        console.log(chunk, chunkURL)

        PIXI.Loader.shared.add(`height_${chunkURL}`, `./isometric-heightmap-exploration/infiniworld/output/${chunkURL}.png`)
        PIXI.Loader.shared.add(`steep_${chunkURL}`, `./isometric-heightmap-exploration/infiniworld/output2/${chunkURL}.png`)

        PIXI.Loader.shared.load(() => {

            const heightTexture = PIXI.Texture.from(PIXI.Loader.shared.resources[`height_${chunkURL}`].data)
            const steepTexture = PIXI.Texture.from(PIXI.Loader.shared.resources[`steep_${chunkURL}`].data)

            const effects = new PIXI.Container()
            effects.filterArea = new PIXI.Rectangle(0, 0, 512, 512)

            const textureIdUniforms = {
                uHeight: heightTexture,
                uSteep: steepTexture,
                steepLimit: 0.5,
                waterLimit: 0.01,
                dirtLimit: 0.3,
                grassLimit: 0.7
            }

            const textureIdFilter = new PIXI.Filter(undefined, PIXI.Loader.shared.resources.texture_id_assign_frag.data, textureIdUniforms)
            effects.filters = [textureIdFilter]

            const frameBuffer = PIXI.RenderTexture.create({ width: 512, height: 512 })
            appStep1.renderer.render(effects, { renderTexture: frameBuffer })
            const pixels = appStep1.renderer.plugins.extract.pixels(frameBuffer)
            const sceneSprite = new PIXI.Sprite(frameBuffer)
            sceneSprite.anchor.set(0.5)
            sceneSprite.position.set(256, 256)

            appStep1.stage.addChild(sceneSprite)

            // three stuff
            const planeGeometry = new THREE.PlaneGeometry(meshSize, meshSize, meshVerts, meshVerts)

            const sz = 1.0
            planeGeometry.scale(sz, sz, sz)

            const material = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide })
            material.displacementScale = displacementScale

            const tex = new THREE.DataTexture(pixels, 512, 512)
            tex.flipY = true
            tex.needsUpdate = true
            material.map = tex

            const displacementMap = new THREE.TextureLoader().load(`./isometric-heightmap-exploration/infiniworld/output/${chunkURL}.png`)
            displacementMap.rotation = Math.PI * 0.5
            material.displacementMap = displacementMap

            const plane = new THREE.Mesh(planeGeometry, material)
            plane.castShadow = true
            plane.receiveShadow = true

            plane.position.set(chunkOffset.x * meshSize, -chunkOffset.y * meshSize)

            baseObj.add(plane)

            // const stats = Stats()
            // // document.querySelector('.App').appendChild(stats.dom)

            // const gui = new GUI()
            // gui.width = 400
            // gui.hide()

            // const data = {
            //     color: material.color.getHex(),
            //     emissive: material.emissive.getHex(),
            //     specular: material.specular.getHex(),
            // }
            // const planeData = {
            //     width: 3.6,
            //     height: 1.8,
            //     widthSegments: 360,
            //     heightSegments: 180,
            // }

            // const sunData = {
            //     sunRotation: Math.PI,
            //     sunHeight: 10
            // }

            // const sunFolder = gui.addFolder('Settings')
            // sunFolder.add(sunData, 'sunRotation', 0, Math.PI * 2.0)
            // sunFolder.add(sunData, 'sunHeight', 1, 40)
            // sunFolder.add(material, 'displacementScale', 0, 4, 0.01)
            // sunFolder.open()

            /////////////////////////////////////////
            // function regeneratePlaneGeometry() {
            //     const newGeometry = new THREE.PlaneGeometry(
            //         planeData.width,
            //         planeData.height,
            //         planeData.widthSegments,
            //         planeData.heightSegments
            //     )
            //     plane.geometry.dispose()
            //     plane.geometry = newGeometry
            // }
            renderer.render(scene, camera)
            document.querySelector('.pixi-step-1').style.display = 'none'
            callback()

        })
    }


}