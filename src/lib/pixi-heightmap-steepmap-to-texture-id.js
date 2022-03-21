import * as PIXI from 'pixi.js'

export default function heightmap_to_steepmap(callback) {
    const app = new PIXI.Application({
        width: 512,
        height: 512,
        backgroundColor: 0xFFFF00,
        resolution: 1,
        forceCanvas: true
    })

    document.querySelector('.pixi-step-1').appendChild(app.view)

    const chunkSize = 512
    const spawnPoint = { x: 33263, y: 43986 }
    const position = { x: spawnPoint.x, y: spawnPoint.y }
    // const position = { x: 64 * chunkSize, y: 64 * chunkSize }

    const chunk = { x: Math.floor(position.x / chunkSize), y: Math.floor(position.y / chunkSize) }
    const chunkURL = `chunk_${String(chunk.x).padStart(4, '0')}_${String(chunk.y).padStart(4, '0')}`

    console.log(chunk, chunkURL)

    PIXI.Loader.shared.add('height_chunk', `./isometric-heightmap-exploration/infiniworld/output/${chunkURL}.png`)
    PIXI.Loader.shared.add('steep_chunk', `./isometric-heightmap-exploration/infiniworld/output2/${chunkURL}.png`)
    PIXI.Loader.shared.add('texture_id_assign_frag', `./isometric-heightmap-exploration/textureIdAssign.frag`)

    const screenBuffer = PIXI.RenderTexture.create({ width: 512, height: 512 })
    const screenSprite = new PIXI.Sprite(screenBuffer)

    const rotatecontainer = new PIXI.Container()
    app.stage.addChild(rotatecontainer)

    PIXI.Loader.shared.load(() => {

        const heightTexture = PIXI.Texture.from(PIXI.Loader.shared.resources.height_chunk.data)
        const steepTexture = PIXI.Texture.from(PIXI.Loader.shared.resources.steep_chunk.data)

        const effects = new PIXI.Container()
        effects.filterArea = new PIXI.Rectangle(0, 0, 512, 512)

        const textureIdUniforms = {
            uHeight: heightTexture,
            uSteep: steepTexture,
            steepLimit: 0.5,
            waterLimit: 0.01,
            dirtLimit: 0.3,
            grassLimit: 1.1
        }

        const textureIdFilter = new PIXI.Filter(undefined, PIXI.Loader.shared.resources.texture_id_assign_frag.data, textureIdUniforms)
        effects.filters = [textureIdFilter]

        const frameBuffer = PIXI.RenderTexture.create({ width: 512, height: 512 })
        app.renderer.render(effects, { renderTexture: frameBuffer })
        const pixels = app.renderer.plugins.extract.pixels(frameBuffer)
        // console.log(pixels)

        const sceneSprite = new PIXI.Sprite(frameBuffer)
        sceneSprite.anchor.set(0.5)
        sceneSprite.position.set(256,256)
        sceneSprite.scale.set(1,-1)
        
        app.stage.addChild(sceneSprite)

        callback({ pixels, chunkURL, chunk })

    })

}