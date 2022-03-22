varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform sampler2D uGrass;
uniform sampler2D uRock;
uniform sampler2D uDirt;

uniform float texScale;

const vec4 TID_grass = vec4(0.0, 1.0, 0.0, 1.0);    // red
const vec4 TID_rock = vec4(1.0, 1.0, 0.0, 1.0);     // yellow
const vec4 TID_dirt = vec4(1.0, 0.0, 1.0, 1.0);     // purple
const vec4 TID_water = vec4(0.0, 0.0, 1.0, 1.0);    // blue


const float epsilon = 0.01;
const float textureSquish = 20.0;

void main() {
    vec4 c = texture2D(uSampler, vTextureCoord);

    if(length(c - TID_grass) < epsilon) {
        gl_FragColor = texture2D(uGrass, vTextureCoord * texScale * textureSquish);
    } else if(length(c - TID_rock) < epsilon) {
        gl_FragColor = texture2D(uRock, vTextureCoord * texScale * textureSquish);
    } else if(length(c - TID_dirt) < epsilon) {
        gl_FragColor = texture2D(uDirt, vTextureCoord * texScale * textureSquish);
    } else if(length(c - TID_water) < epsilon) {
        gl_FragColor = TID_water;
    } else {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
}