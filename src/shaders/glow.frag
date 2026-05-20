// Post-process glow fragment — reserved for future bloom pass
uniform sampler2D tDiffuse;
uniform float uIntensity;
varying vec2 vUv;

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  vec3 glow = color.rgb + lum * uIntensity * vec3(1.0, 0.92, 0.85);
  gl_FragColor = vec4(glow, color.a);
}
