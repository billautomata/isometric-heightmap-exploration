import * as PIXI from 'pixi.js'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'
import * as async from 'async'


PIXI.settings.WRAP_MODE = PIXI.WRAP_MODES.REPEAT

const range = 8
const cameraDistance = 300
const chunkSize = 512
const meshSize = 10
const meshVerts = 128
const displacementScale = 20

const spawnPoint = { x: 33263, y: 43986 }

// spawnPoint.x = 65536 / 2
// spawnPoint.y = 65536 / 2

const step3Buffer = new ArrayBuffer(chunkSize * chunkSize * 4)
const step3Pixels = new Uint8Array(step3Buffer)

export default function allSteps() {

    PIXI.Loader.shared.add('texture_id_assign_frag', `./isometric-heightmap-exploration/textureIdAssign.frag`)
    PIXI.Loader.shared.add('texture_id_to_ng_frag', `./isometric-heightmap-exploration/textureIdToNG.frag`)
    PIXI.Loader.shared.add('texture_dirt', './isometric-heightmap-exploration/infiniworld/dirt.png')
    PIXI.Loader.shared.add('texture_grass', './isometric-heightmap-exploration/infiniworld/grass.png')
    PIXI.Loader.shared.add('texture_rock', './isometric-heightmap-exploration/infiniworld/rock.png')
    PIXI.Loader.shared.concurrency = 20

    const appStep1 = new PIXI.Application({
        width: chunkSize,
        height: chunkSize,
        backgroundColor: 0xFFFF00,
        resolution: 1
    })

    document.querySelector('.pixi-step-1').appendChild(appStep1.view)

    const appStep2 = new PIXI.Application({
        width: chunkSize,
        height: chunkSize,
        backgroundColor: 0xFFFF00,
        resolution: 1
    })

    const viewSprite = new PIXI.Sprite()

    document.querySelector('.pixi-step-2').appendChild(appStep2.view)

    // threejs section
    const scene = new THREE.Scene()
    // scene.add(new THREE.AxesHelper(5))

    const baseObj = new THREE.Object3D()
    scene.add(baseObj)

    // const light = new THREE.DirectionalLight(0xffffff, 1)
    // light.position.set(0, 0, 30)
    // light.lookAt(baseObj.position)
    // light.castShadow = true
    // baseObj.add(light)

    // const spotlight = new THREE.SpotLight(0xffffff, 2, 300, Math.PI*0.15)
    // spotlight.position.set(10, 100, 100)
    // spotlight.lookAt(baseObj.position)
    // spotlight.castShadow = true
    // baseObj.add(spotlight)
    // spotlight.shadow.mapSize.width = 4096;
    // spotlight.shadow.mapSize.height = 4096;
    // spotlight.shadow.camera.near = 0.01;     // default
    // spotlight.shadow.camera.far = 30;      // default
    // spotlight.shadow.camera.fov = 30;
    // const spotlightHelper = new THREE.SpotLightHelper(spotlight)
    // baseObj.add(spotlightHelper)

    const lamp = new THREE.AmbientLight(0xFFFFFF, 1)
    scene.add(lamp)

    const pointlight = new THREE.PointLight(0xFFFFFF, 2.0)
    // pointlight.castShadow = true
    pointlight.position.set(0, 0, 60)

    pointlight.shadow.mapSize.width = 4096;
    pointlight.shadow.mapSize.height = 4096;
    // pointlight.shadow.camera.near = 0.01;     // default
    // pointlight.shadow.camera.far = 30;      // default
    // pointlight.shadow.camera.fov = 30;

    // baseObj.add(pointlight)

    //Set up shadow properties for the light

    const width = (range * 1.9) * meshSize
    const height = width

    const camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 0.001, 1000);
    const a = cameraDistance
    camera.position.y = -a
    camera.position.z = a * Math.sqrt(3)

    const renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true, autoClear: true })
    const threejsCtx = renderer.getContext()
    console.log('context', threejsCtx)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // renderer.shadowMap.type = THREE.BasicShadowMap;

    renderer.setSize(512, 512)

    document.querySelector('.three-displace-step').appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    // controls.screenSpacePanning = true //so that panning up and down doesn't zoom in/out
    controls.addEventListener('change', () => { 
        renderer.render(scene, camera) 
        renderer.context.readPixels(0, 0, 512, 512, threejsCtx.RGBA, threejsCtx.UNSIGNED_BYTE, step3Pixels)
        viewSprite.texture = PIXI.Texture.fromBuffer(step3Pixels, 512, 512)
    })

    const position = { x: spawnPoint.x, y: spawnPoint.y }
    const chunkCenter = range

    const fns = []
    for (let x = 0; x <= range * 2; ++x) {
        for (let y = 0; y <= range * 2; ++y) {
            addChunkToPixiLoader(position, { x: x - chunkCenter, y: y - chunkCenter })
        }
    }

    PIXI.Loader.shared.load(() => {        
        const finalPassUniforms = {
            uRock: PIXI.Texture.from(PIXI.Loader.shared.resources.texture_rock.data),
            uGrass: PIXI.Texture.from(PIXI.Loader.shared.resources.texture_grass.data),
            uDirt: PIXI.Texture.from(PIXI.Loader.shared.resources.texture_dirt.data),
            texScale: range
        }
        const finalPassFilter = new PIXI.Filter(undefined, PIXI.Loader.shared.resources.texture_id_to_ng_frag.data, finalPassUniforms)

        for (let x = 0; x <= range * 2; ++x) {
            for (let y = 0; y <= range * 2; ++y) {
                fns.push((done) => {
                    generateChunk(position, { x: x - chunkCenter, y: y - chunkCenter }, done)
                })
            }
        }

        fns.push(done => {
            setTimeout(() => {
                finalRender()
                done()
            }, 100)
        })

        function finalRender() {
            renderer.render(scene, camera)
            renderer.context.readPixels(0, 0, 512, 512, threejsCtx.RGBA, threejsCtx.UNSIGNED_BYTE, step3Pixels)
            // const viewSprite = new PIXI.Sprite()
            viewSprite.texture = PIXI.Texture.fromBuffer(step3Pixels, 512, 512)
            viewSprite.filters = [finalPassFilter]
            viewSprite.anchor.set(0.5, 0.5)
            viewSprite.position.set(chunkSize / 2, chunkSize / 2)
            viewSprite.scale.set(1, -1)
            appStep2.stage.addChild(viewSprite)
        }

        async.series(fns)

    })



    function addChunkToPixiLoader(pos, chunkOffset) {
        // document.querySelector('.pixi-step-1').style.display = 'block'
        const chunk = { x: Math.floor(position.x / chunkSize), y: Math.floor(position.y / chunkSize) }
        chunk.x += chunkOffset.x
        chunk.y += chunkOffset.y
        const chunkURL = `chunk_${String(chunk.x).padStart(4, '0')}_${String(chunk.y).padStart(4, '0')}`

        // console.log(chunk, chunkURL)

        PIXI.Loader.shared.add(`height_${chunkURL}`, `./isometric-heightmap-exploration/infiniworld/output/${chunkURL}.png`)
        PIXI.Loader.shared.add(`steep_${chunkURL}`, `./isometric-heightmap-exploration/infiniworld/output2/${chunkURL}.png`)
    }

    function generateChunk(pos, chunkOffset, callback, render) {
        // document.querySelector('.pixi-step-1').style.display = 'block'
        const chunk = { x: Math.floor(position.x / chunkSize), y: Math.floor(position.y / chunkSize) }
        chunk.x += chunkOffset.x
        chunk.y += chunkOffset.y
        const chunkURL = `chunk_${String(chunk.x).padStart(4, '0')}_${String(chunk.y).padStart(4, '0')}`

        console.log(chunk, chunkURL)

        const heightTexture = PIXI.Texture.from(PIXI.Loader.shared.resources[`height_${chunkURL}`].data)
        const heightBaseTexture = heightTexture.castToBaseTexture()
        console.log(heightBaseTexture)
        const steepTexture = PIXI.Texture.from(PIXI.Loader.shared.resources[`steep_${chunkURL}`].data)

        const effects = new PIXI.Container()
        effects.filterArea = new PIXI.Rectangle(0, 0, 512, 512)

        const textureIdUniforms = {
            uHeight: heightTexture,
            uSteep: steepTexture,
            steepLimit: 0.2,
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
        // material.flatShading = true

        const tex = new THREE.DataTexture(pixels, 512, 512)
        tex.flipY = true
        tex.needsUpdate = true
        material.map = tex

        // const displacementMap = 
        const displacementMap = new THREE.TextureLoader().load(PIXI.Loader.shared.resources[`height_${chunkURL}`].url)
        // displacementMap.rotation = Math.PI * 0.5
        // material.displacementMap = new THREE.Texture() //  new THREE.Texture(PIXI.Loader.shared.resources[`height_${chunkURL}`].texture)  /// displacementMap
        // material.displacementMap = new THREE.TextureLoader().load(`./isometric-heightmap-exploration/infiniworld/output/${chunkURL}.png`)
        // material.displacementMap = new THREE.TextureLoader().load(PIXI.Loader.shared.resources[`height_${chunkURL}`].url)
        // material.displacementMap = new THREE.Texture(heightTexture)

        // const p = new THREE.Texture(PIXI.Loader.shared.resources[`height_${chunkURL}`].data)
        // const p = new THREE.VideoTexture(PIXI.Loader.shared.resources[`height_${chunkURL}`].data)
        // console.log(p)
        material.displacementMap = displacementMap
        // material.displacementMap = new THREE.ImageLoader(PIXI.Loader.shared.resources[`height_${chunkURL}`].data)

        const plane = new THREE.Mesh(planeGeometry, material)
        plane.castShadow = true
        plane.receiveShadow = true

        plane.position.set(chunkOffset.x * meshSize, -chunkOffset.y * meshSize)

        baseObj.add(plane)

        renderer.render(scene, camera)

        document.querySelector('.pixi-step-1').style.display = 'none'
        setTimeout(() => {
            callback()
        })

    }


}