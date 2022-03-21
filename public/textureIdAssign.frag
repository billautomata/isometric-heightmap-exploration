varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D uHeight;
uniform sampler2D uSteep;

const vec4 TID_grass = vec4(0.0, 1.0, 0.0, 1.0);    // red
const vec4 TID_rock = vec4(1.0, 1.0, 0.0, 1.0);     // yellow
const vec4 TID_dirt = vec4(1.0, 0.0, 1.0, 1.0);     // purple
const vec4 TID_water = vec4(0.0, 0.0, 1.0, 1.0);    // blue

uniform bool bShowHeightMap;
uniform bool bShowSteepMap;
uniform bool bShowTextures;

uniform float steepLimit;   // the pivot point where it is always rocks
uniform float waterLimit;   // the end of the water (from zero)
uniform float dirtLimit;    // the end of the dirt
uniform float grassLimit;   // the end of grass

void main() {
    vec2 c = vTextureCoord;
    // c.y -= 1.0;
    // c.y *= -1.0;

    vec4 heightSample = texture2D(uHeight, c);
    vec4 steepSample = texture2D(uSteep, c);

    if(steepSample.r > steepLimit) {
        gl_FragColor = TID_rock;
    } else {
        if(heightSample.r < waterLimit) {
            gl_FragColor = TID_water;
        } else if(heightSample.r < dirtLimit) {
            gl_FragColor = TID_dirt;
        } else if(heightSample.r < grassLimit) {
            gl_FragColor = TID_grass;
        } else {
            gl_FragColor = vec4(1.0);   // snow
        }
    }
    // gl_FragColor = texture2D(uHeight, vTextureCoord);
    // gl_FragColor = steepSample;
    // gl_FragColor = heightSample;
}