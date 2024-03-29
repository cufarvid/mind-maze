// language=GLSL
const vertex = `#version 300 es
precision mediump float;

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoord;

uniform mat4 uViewModel;
uniform mat4 uProjection;

out vec3 vNormal;
out vec2 vTexCoord;
out vec3 vVertexPosition;

void main() {
  vNormal = aNormal;
  vTexCoord = aTexCoord;
  vVertexPosition = (uViewModel * aPosition).xyz;
  gl_Position = uProjection * uViewModel * aPosition;
}
`;

// language=GLSL
const fragment = `#version 300 es
precision mediump float;

uniform mat4 uViewModel;
uniform mediump sampler2D uTexture;

uniform vec3 uAmbientColor[5];
uniform vec3 uDiffuseColor[5];
uniform vec3 uSpecularColor[5];

uniform float uShininess[5];
uniform vec3 uLightPosition[5];
uniform vec3 uLightAttenuation[5];

in vec3 vNormal;
in vec2 vTexCoord;
in vec3 vVertexPosition;

out vec4 oColor;

void main() {
  oColor = vec4(0.0);

  for (int i = 0; i < 5; i++) {
    vec3 lightPosition = (uViewModel * vec4(uLightPosition[i], 1)).xyz;
    float d = distance(vVertexPosition, lightPosition);
    float attenuation = 1.0 / dot(uLightAttenuation[i] * vec3(1, d, d * d), vec3(1, 1, 1));

    vec3 N = (uViewModel * vec4(vNormal, 0)).xyz;
    vec3 L = normalize(lightPosition - vVertexPosition);
    vec3 E = normalize(-vVertexPosition);
    vec3 R = normalize(reflect(-L, N));

    float lambert = max(0.0, dot(L, N));
    float phong = pow(max(0.0, dot(E, R)), uShininess[i]);

    vec3 ambient = uAmbientColor[i];
    vec3 diffuse = uDiffuseColor[i] * lambert;
    vec3 specular = uSpecularColor[i] * phong;

    vec3 light = (ambient + diffuse + specular) * attenuation;

    oColor += texture(uTexture, vTexCoord) * vec4(light, 1);
  }
}
`;

// language=GLSL
const skyVertex = `#version 300 es
in vec4 aPosition;
out vec4 vPosition;

void main() {
  vPosition = aPosition;
  gl_Position = aPosition;
  gl_Position.z = 1.0;
}
`;

// language=GLSL
const skyFragment = `#version 300 es
precision mediump float;
 
uniform samplerCube uSkybox;
uniform mat4 uVDPInverse;

layout(location = 0) out vec4 diffuseColor;
 
in vec4 vPosition;

void main() {
  vec4 t = uVDPInverse * vPosition;
  diffuseColor = texture(uSkybox, normalize(t.xyz / t.w));
}
`;

export default {
  simple: { vertex, fragment },
  skybox: { vertex: skyVertex, fragment: skyFragment },
};
