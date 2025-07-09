import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

// Converting colors to proper format
function normalizeColor(hexCode) {
	return [
		((hexCode >> 16) & 255) / 255,
		((hexCode >> 8) & 255) / 255,
		(255 & hexCode) / 255,
	]
}

// Essential functionality of WebGL
class MiniGl {
	constructor(canvas, width, height, debug = false) {
		const _miniGl = this
		this.canvas = canvas
		this.gl = this.canvas.getContext('webgl', { antialias: true })
		this.meshes = []
		const context = this.gl

		if (width && height) this.setSize(width, height)

		this.debug = debug
			? function (e) {
					console.log(e, ...Array.from(arguments).slice(1))
			  }
			: () => {}

		Object.defineProperties(this, {
			Material: {
				enumerable: false,
				value: class {
					constructor(vertexShaders, fragments, uniforms = {}) {
						const material = this

						function getShaderByType(type, source) {
							const shader = context.createShader(type)
							context.shaderSource(shader, source)
							context.compileShader(shader)
							if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
								console.error(context.getShaderInfoLog(shader))
							}
							return shader
						}

						function getUniformVariableDeclarations(uniforms, type) {
							return Object.entries(uniforms)
								.map(([uniform, value]) => value.getDeclaration(uniform, type))
								.join('\n')
						}

						material.uniforms = uniforms
						material.uniformInstances = []

						const prefix = 'precision highp float;'

						material.vertexSource = `
              ${prefix}
              attribute vec4 position;
              attribute vec2 uv;
              attribute vec2 uvNorm;
              ${getUniformVariableDeclarations(
								_miniGl.commonUniforms,
								'vertex'
							)}
              ${getUniformVariableDeclarations(uniforms, 'vertex')}
              ${vertexShaders}
            `

						material.fragmentSource = `
              ${prefix}
              ${getUniformVariableDeclarations(
								_miniGl.commonUniforms,
								'fragment'
							)}
              ${getUniformVariableDeclarations(uniforms, 'fragment')}
              ${fragments}
            `

						material.vertexShader = getShaderByType(
							context.VERTEX_SHADER,
							material.vertexSource
						)
						material.fragmentShader = getShaderByType(
							context.FRAGMENT_SHADER,
							material.fragmentSource
						)
						material.program = context.createProgram()

						context.attachShader(material.program, material.vertexShader)
						context.attachShader(material.program, material.fragmentShader)
						context.linkProgram(material.program)

						if (
							!context.getProgramParameter(
								material.program,
								context.LINK_STATUS
							)
						) {
							console.error(context.getProgramInfoLog(material.program))
						}

						context.useProgram(material.program)
						material.attachUniforms(void 0, _miniGl.commonUniforms)
						material.attachUniforms(void 0, material.uniforms)
					}

					attachUniforms(name, uniforms) {
						const material = this
						if (name === undefined) {
							Object.entries(uniforms).forEach(([name, uniform]) => {
								material.attachUniforms(name, uniform)
							})
						} else if (uniforms.type === 'array') {
							uniforms.value.forEach((uniform, i) =>
								material.attachUniforms(`${name}[${i}]`, uniform)
							)
						} else if (uniforms.type === 'struct') {
							Object.entries(uniforms.value).forEach(([uniform, i]) =>
								material.attachUniforms(`${name}.${uniform}`, i)
							)
						} else {
							material.uniformInstances.push({
								uniform: uniforms,
								location: context.getUniformLocation(material.program, name),
							})
						}
					}
				},
			},

			Uniform: {
				enumerable: false,
				value: class {
					constructor(e) {
						this.type = 'float'
						Object.assign(this, e)
						this.typeFn =
							{
								float: '1f',
								int: '1i',
								vec2: '2fv',
								vec3: '3fv',
								vec4: '4fv',
								mat4: 'Matrix4fv',
							}[this.type] || '1f'
						this.update()
					}

					update(value) {
						if (this.value !== undefined) {
							context[`uniform${this.typeFn}`](
								value,
								this.typeFn.indexOf('Matrix') === 0
									? this.transpose
									: this.value,
								this.typeFn.indexOf('Matrix') === 0 ? this.value : null
							)
						}
					}

					getDeclaration(name, type, length) {
						const uniform = this
						if (uniform.excludeFrom !== type) {
							if (uniform.type === 'array') {
								return (
									uniform.value[0].getDeclaration(
										name,
										type,
										uniform.value.length
									) + `\nconst int ${name}_length = ${uniform.value.length};`
								)
							}
							if (uniform.type === 'struct') {
								let name_no_prefix = name.replace('u_', '')
								name_no_prefix =
									name_no_prefix.charAt(0).toUpperCase() +
									name_no_prefix.slice(1)
								return (
									`uniform struct ${name_no_prefix} {\n` +
									Object.entries(uniform.value)
										.map(([name, uniform]) =>
											uniform.getDeclaration(name, type).replace(/^uniform/, '')
										)
										.join('') +
									`\n} ${name}${length > 0 ? `[${length}]` : ''};`
								)
							}
							return `uniform ${uniform.type} ${name}${
								length > 0 ? `[${length}]` : ''
							};`
						}
					}
				},
			},

			PlaneGeometry: {
				enumerable: false,
				value: class {
					constructor(width, height, n, i, orientation) {
						this.attributes = {
							position: new _miniGl.Attribute({
								target: context.ARRAY_BUFFER,
								size: 3,
							}),
							uv: new _miniGl.Attribute({
								target: context.ARRAY_BUFFER,
								size: 2,
							}),
							uvNorm: new _miniGl.Attribute({
								target: context.ARRAY_BUFFER,
								size: 2,
							}),
							index: new _miniGl.Attribute({
								target: context.ELEMENT_ARRAY_BUFFER,
								size: 3,
								type: context.UNSIGNED_SHORT,
							}),
						}
						this.setTopology(n, i)
						this.setSize(width, height, orientation)
					}

					setTopology(e = 1, t = 1) {
						const n = this
						n.xSegCount = e
						n.ySegCount = t
						n.vertexCount = (n.xSegCount + 1) * (n.ySegCount + 1)
						n.quadCount = n.xSegCount * n.ySegCount * 2
						n.attributes.uv.values = new Float32Array(2 * n.vertexCount)
						n.attributes.uvNorm.values = new Float32Array(2 * n.vertexCount)
						n.attributes.index.values = new Uint16Array(3 * n.quadCount)

						for (let e = 0; e <= n.ySegCount; e++) {
							for (let t = 0; t <= n.xSegCount; t++) {
								const i = e * (n.xSegCount + 1) + t
								n.attributes.uv.values[2 * i] = t / n.xSegCount
								n.attributes.uv.values[2 * i + 1] = 1 - e / n.ySegCount
								n.attributes.uvNorm.values[2 * i] = (t / n.xSegCount) * 2 - 1
								n.attributes.uvNorm.values[2 * i + 1] =
									1 - (e / n.ySegCount) * 2

								if (t < n.xSegCount && e < n.ySegCount) {
									const s = e * n.xSegCount + t
									n.attributes.index.values[6 * s] = i
									n.attributes.index.values[6 * s + 1] = i + 1 + n.xSegCount
									n.attributes.index.values[6 * s + 2] = i + 1
									n.attributes.index.values[6 * s + 3] = i + 1
									n.attributes.index.values[6 * s + 4] = i + 1 + n.xSegCount
									n.attributes.index.values[6 * s + 5] = i + 2 + n.xSegCount
								}
							}
						}
						n.attributes.uv.update()
						n.attributes.uvNorm.update()
						n.attributes.index.update()
					}

					setSize(width = 1, height = 1, orientation = 'xz') {
						const geometry = this
						geometry.width = width
						geometry.height = height
						geometry.orientation = orientation

						if (
							!geometry.attributes.position.values ||
							geometry.attributes.position.values.length !==
								3 * geometry.vertexCount
						) {
							geometry.attributes.position.values = new Float32Array(
								3 * geometry.vertexCount
							)
						}

						const o = width / -2
						const r = height / -2
						const segment_width = width / geometry.xSegCount
						const segment_height = height / geometry.ySegCount

						for (let yIndex = 0; yIndex <= geometry.ySegCount; yIndex++) {
							const t = r + yIndex * segment_height
							for (let xIndex = 0; xIndex <= geometry.xSegCount; xIndex++) {
								const r = o + xIndex * segment_width
								const l = yIndex * (geometry.xSegCount + 1) + xIndex
								geometry.attributes.position.values[
									3 * l + 'xyz'.indexOf(orientation[0])
								] = r
								geometry.attributes.position.values[
									3 * l + 'xyz'.indexOf(orientation[1])
								] = -t
							}
						}
						geometry.attributes.position.update()
					}
				},
			},

			Mesh: {
				enumerable: false,
				value: class {
					constructor(geometry, material) {
						const mesh = this
						mesh.geometry = geometry
						mesh.material = material
						mesh.wireframe = false
						mesh.attributeInstances = []

						Object.entries(mesh.geometry.attributes).forEach(
							([e, attribute]) => {
								mesh.attributeInstances.push({
									attribute: attribute,
									location: attribute.attach(e, mesh.material.program),
								})
							}
						)
						_miniGl.meshes.push(mesh)
					}

					draw() {
						context.useProgram(this.material.program)
						this.material.uniformInstances.forEach(({ uniform, location }) =>
							uniform.update(location)
						)
						this.attributeInstances.forEach(({ attribute, location }) =>
							attribute.use(location)
						)
						context.drawElements(
							this.wireframe ? context.LINES : context.TRIANGLES,
							this.geometry.attributes.index.values.length,
							context.UNSIGNED_SHORT,
							0
						)
					}

					remove() {
						_miniGl.meshes = _miniGl.meshes.filter((e) => e != this)
					}
				},
			},

			Attribute: {
				enumerable: false,
				value: class {
					constructor(e) {
						this.type = context.FLOAT
						this.normalized = false
						this.buffer = context.createBuffer()
						Object.assign(this, e)
						this.update()
					}

					update() {
						if (this.values !== undefined) {
							context.bindBuffer(this.target, this.buffer)
							context.bufferData(this.target, this.values, context.STATIC_DRAW)
						}
					}

					attach(e, t) {
						const n = context.getAttribLocation(t, e)
						if (this.target === context.ARRAY_BUFFER) {
							context.enableVertexAttribArray(n)
							context.vertexAttribPointer(
								n,
								this.size,
								this.type,
								this.normalized,
								0,
								0
							)
						}
						return n
					}

					use(e) {
						context.bindBuffer(this.target, this.buffer)
						if (this.target === context.ARRAY_BUFFER) {
							context.enableVertexAttribArray(e)
							context.vertexAttribPointer(
								e,
								this.size,
								this.type,
								this.normalized,
								0,
								0
							)
						}
					}
				},
			},
		})

		const a = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
		this.commonUniforms = {
			projectionMatrix: new this.Uniform({ type: 'mat4', value: a }),
			modelViewMatrix: new this.Uniform({ type: 'mat4', value: a }),
			resolution: new this.Uniform({ type: 'vec2', value: [1, 1] }),
			aspectRatio: new this.Uniform({ type: 'float', value: 1 }),
		}
	}

	setSize(e = 640, t = 480) {
		this.width = e
		this.height = t
		this.canvas.width = e
		this.canvas.height = t
		this.gl.viewport(0, 0, e, t)
		this.commonUniforms.resolution.value = [e, t]
		this.commonUniforms.aspectRatio.value = e / t
	}

	setOrthographicCamera(e = 0, t = 0, n = 0, i = -2000, s = 2000) {
		this.commonUniforms.projectionMatrix.value = [
			2 / this.width,
			0,
			0,
			0,
			0,
			2 / this.height,
			0,
			0,
			0,
			0,
			2 / (i - s),
			0,
			e,
			t,
			n,
			1,
		]
	}

	render() {
		this.gl.clearColor(0, 0, 0, 0)
		this.gl.clearDepth(1)
		this.meshes.forEach((e) => e.draw())
	}
}

// Gradient class
class Gradient {
	constructor() {
		this.el = void 0
		this.angle = 0
		this.isLoadedClass = false
		this.isScrolling = false
		this.isIntersecting = false
		this.shaderFiles = void 0
		this.vertexShader = void 0
		this.sectionColors = void 0
		this.conf = void 0
		this.uniforms = void 0
		this.t = 1253106
		this.last = 0
		this.width = void 0
		this.height = 600
		this.xSegCount = void 0
		this.ySegCount = void 0
		this.mesh = void 0
		this.material = void 0
		this.geometry = void 0
		this.minigl = void 0
		this.amp = 320
		this.seed = 5
		this.freqX = 14e-5
		this.freqY = 29e-5
		this.freqDelta = 1e-5
		this.activeColors = [1, 1, 1, 1]

		this.resize = () => {
			this.width = this.el.offsetWidth || window.innerWidth
			this.height = this.el.offsetHeight || window.innerHeight
			this.minigl.setSize(this.width, this.height)
			this.minigl.setOrthographicCamera()
			this.xSegCount = Math.ceil(this.width * this.conf.density[0])
			this.ySegCount = Math.ceil(this.height * this.conf.density[1])
			this.mesh.geometry.setTopology(this.xSegCount, this.ySegCount)
			this.mesh.geometry.setSize(this.width, this.height)
			this.mesh.material.uniforms.u_shadow_power.value =
				this.width < 600 ? 5 : 6
		}

		this.animate = (e) => {
			if (!this.shouldSkipFrame(e)) {
				this.t += Math.min(e - this.last, 1000 / 15)
				this.last = e
				this.mesh.material.uniforms.u_time.value = this.t
				this.minigl.render()
			}
			if (this.conf.playing) {
				requestAnimationFrame(this.animate)
			}
		}

		this.pause = () => {
			this.conf.playing = false
		}

		this.play = () => {
			requestAnimationFrame(this.animate)
			this.conf.playing = true
		}

		this.initGradient = (selector) => {
			this.el = document.querySelector(selector)
			this.connect()
			return this
		}
	}

	async connect() {
		this.shaderFiles = {
			vertex: `
        varying vec3 v_color;
        
        vec3 mod289(vec3 x) {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }
        
        vec4 mod289(vec4 x) {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }
        
        vec4 permute(vec4 x) {
          return mod289(((x*34.0)+1.0)*x);
        }
        
        vec4 taylorInvSqrt(vec4 r) {
          return 1.79284291400159 - 0.85373472095314 * r;
        }
        
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          
          i = mod289(i);
          vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          
          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);
          
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
        
        vec3 blendNormal(vec3 base, vec3 blend) {
          return blend;
        }
        
        vec3 blendNormal(vec3 base, vec3 blend, float opacity) {
          return (blendNormal(base, blend) * opacity + base * (1.0 - opacity));
        }
        
        void main() {
          float time = u_time * u_global.noiseSpeed;
          vec2 noiseCoord = resolution * uvNorm * u_global.noiseFreq;
          vec2 st = 1. - uvNorm.xy;
          
          float tilt = resolution.y / 2.0 * uvNorm.y;
          float incline = resolution.x * uvNorm.x / 2.0 * u_vertDeform.incline;
          float offset = resolution.x / 2.0 * u_vertDeform.incline * mix(u_vertDeform.offsetBottom, u_vertDeform.offsetTop, uv.y);
          
          float noise = snoise(vec3(
            noiseCoord.x * u_vertDeform.noiseFreq.x + time * u_vertDeform.noiseFlow,
            noiseCoord.y * u_vertDeform.noiseFreq.y,
            time * u_vertDeform.noiseSpeed + u_vertDeform.noiseSeed
          )) * u_vertDeform.noiseAmp;
          
          noise *= 1.0 - pow(abs(uvNorm.y), 2.0);
          noise = max(0.0, noise);
          
          vec3 pos = vec3(
            position.x,
            position.y + tilt + incline + noise - offset,
            position.z
          );
          
          if (u_active_colors[0] == 1.) {
            v_color = u_baseColor;
          }
          
          for (int i = 0; i < u_waveLayers_length; i++) {
            if (u_active_colors[i + 1] == 1.) {
              WaveLayers layer = u_waveLayers[i];
              
              float noise = smoothstep(
                layer.noiseFloor,
                layer.noiseCeil,
                snoise(vec3(
                  noiseCoord.x * layer.noiseFreq.x + time * layer.noiseFlow,
                  noiseCoord.y * layer.noiseFreq.y,
                  time * layer.noiseSpeed + layer.noiseSeed
                )) / 2.0 + 0.5
              );
              
              v_color = blendNormal(v_color, layer.color, pow(noise, 4.));
            }
          }
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
			fragment: `
        varying vec3 v_color;
        
        void main() {
          vec3 color = v_color;
          if (u_darken_top == 1.0) {
            vec2 st = gl_FragCoord.xy/resolution.xy;
            color.g -= pow(st.y + sin(-12.0) * st.x, u_shadow_power) * 0.4;
          }
          gl_FragColor = vec4(color, 1.0);
        }
      `,
		}

		this.conf = {
			presetName: '',
			wireframe: false,
			density: [0.06, 0.16],
			zoom: 1,
			rotation: 0,
			playing: true,
		}

		if (document.querySelectorAll('canvas').length >= 1) {
			this.minigl = new MiniGl(this.el, null, null, true)
			requestAnimationFrame(() => {
				if (this.el) {
					this.init()
				}
			})
		}
	}

	initMaterial() {
		this.uniforms = {
			u_time: new this.minigl.Uniform({ value: 0 }),
			u_shadow_power: new this.minigl.Uniform({ value: 5 }),
			u_darken_top: new this.minigl.Uniform({ value: 1 }),
			u_active_colors: new this.minigl.Uniform({
				value: this.activeColors,
				type: 'vec4',
			}),
			u_global: new this.minigl.Uniform({
				value: {
					noiseFreq: new this.minigl.Uniform({
						value: [this.freqX, this.freqY],
						type: 'vec2',
					}),
					noiseSpeed: new this.minigl.Uniform({ value: 5e-6 }),
				},
				type: 'struct',
			}),
			u_vertDeform: new this.minigl.Uniform({
				value: {
					incline: new this.minigl.Uniform({
						value: Math.sin(this.angle) / Math.cos(this.angle),
					}),
					offsetTop: new this.minigl.Uniform({ value: -0.5 }),
					offsetBottom: new this.minigl.Uniform({ value: -0.5 }),
					noiseFreq: new this.minigl.Uniform({ value: [3, 4], type: 'vec2' }),
					noiseAmp: new this.minigl.Uniform({ value: this.amp }),
					noiseSpeed: new this.minigl.Uniform({ value: 10 }),
					noiseFlow: new this.minigl.Uniform({ value: 3 }),
					noiseSeed: new this.minigl.Uniform({ value: this.seed }),
				},
				type: 'struct',
				excludeFrom: 'fragment',
			}),
			u_baseColor: new this.minigl.Uniform({
				value: this.sectionColors[0],
				type: 'vec3',
				excludeFrom: 'fragment',
			}),
			u_waveLayers: new this.minigl.Uniform({
				value: [],
				excludeFrom: 'fragment',
				type: 'array',
			}),
		}

		for (let e = 1; e < this.sectionColors.length; e += 1) {
			this.uniforms.u_waveLayers.value.push(
				new this.minigl.Uniform({
					value: {
						color: new this.minigl.Uniform({
							value: this.sectionColors[e],
							type: 'vec3',
						}),
						noiseFreq: new this.minigl.Uniform({
							value: [
								2 + e / this.sectionColors.length,
								3 + e / this.sectionColors.length,
							],
							type: 'vec2',
						}),
						noiseSpeed: new this.minigl.Uniform({ value: 11 + 0.3 * e }),
						noiseFlow: new this.minigl.Uniform({ value: 6.5 + 0.3 * e }),
						noiseSeed: new this.minigl.Uniform({ value: this.seed + 10 * e }),
						noiseFloor: new this.minigl.Uniform({ value: 0.1 }),
						noiseCeil: new this.minigl.Uniform({ value: 0.63 + 0.07 * e }),
					},
					type: 'struct',
				})
			)
		}

		return new this.minigl.Material(
			this.shaderFiles.vertex,
			this.shaderFiles.fragment,
			this.uniforms
		)
	}

	initMesh() {
		this.material = this.initMaterial()
		this.geometry = new this.minigl.PlaneGeometry()
		this.mesh = new this.minigl.Mesh(this.geometry, this.material)
	}

	shouldSkipFrame(e) {
		return (
			!!window.document.hidden || !this.conf.playing || parseInt(e, 10) % 2 == 0
		)
	}

	init() {
		this.initGradientColors()
		this.initMesh()
		this.resize()
		requestAnimationFrame(this.animate)
		window.addEventListener('resize', this.resize)
	}

	initGradientColors() {
		// Using your specified colors: #12448F, #93BEFF, #A2C7FF
		this.sectionColors = [
			normalizeColor(0x12448f), // Main color - your original
			normalizeColor(0x1a5bb8), // Lighter blue
			normalizeColor(0x2d73d4), // Light blue
			normalizeColor(0x4a8cf0), // Bright blue
		]
	}
}

// Main export function that creates and initializes the gradient
export default function createGradient() {
	const container = document.querySelector('#testimonials-home')
	if (!container) {
		console.error('Container not found')
		return
	}

	// Create canvas element
	const canvas = document.createElement('canvas')
	canvas.id = 'gradient-canvas'
	canvas.style.width = '100%'
	canvas.style.height = '100%'
	canvas.style.position = 'absolute'
	canvas.style.bottom = '100%'
	canvas.style.left = '0'
	canvas.style.zIndex = '-1'

	container.appendChild(canvas)

	// Initialize gradient
	const gradient = new Gradient()
	gradient.initGradient('#gradient-canvas')

	let tl = gsap.timeline({
		scrollTrigger: {
			trigger: canvas,
			start: 'top top',
			end: '+=200%',
			pin: true,
		},
	})

	// Return cleanup function
	return () => {
		if (canvas && canvas.parentNode) {
			canvas.parentNode.removeChild(canvas)
		}
		if (gradient.minigl) {
			gradient.pause()
			window.removeEventListener('resize', gradient.resize)
		}
	}
}
