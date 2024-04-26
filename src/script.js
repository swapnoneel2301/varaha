import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI({
    width: 360
})
gui.close();

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
const parameters = {
    count: 23000,
    size: 0.04,
    radius: 5,
    branches: 3,
    spin: 1.241,
    randomness: 0.387,
    randomnessPower: 2.088,
    insideColor: '#ff6030',
    outsideColor: '#1b3984'
}
let geometry = null;
let material = null;
let particles = null;

const galaxyGenerator = ()=>{

    if(particles!==null){
        geometry.dispose();
        material.dispose();
        scene.remove(particles);
    }
    geometry = new THREE.BufferGeometry();
    const points = new Float32Array(parameters.count*3);
    const colors = new Float32Array(parameters.count*3);

    const insideColor = new THREE.Color(parameters.insideColor);
    const outsideColor = new THREE.Color(parameters.outsideColor);
    


    for(let i=0;i<parameters.count;i++){
        const i3 = i*3;

        const radius = Math.random() * parameters.radius;
        const branchAngle = (i%parameters.branches) * 2 * (Math.PI/parameters.branches);
        const spinAngle = radius * parameters.spin;
        
        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius


        points[i3] = Math.sin(branchAngle + spinAngle) * radius + randomX;
        points[i3+1] = randomY;
        points[i3+2] = Math.cos(branchAngle + spinAngle) * radius + randomZ;

        const mixedColor = insideColor.clone();
        mixedColor.lerp(outsideColor,radius/parameters.radius);

        colors[i3] = mixedColor.r;
        colors[i3+1] = mixedColor.g;
        colors[i3+2] = mixedColor.b;
        
    }
   
    geometry.setAttribute('position',new THREE.BufferAttribute(points,3));
    geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
    
    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });
    

    particles = new THREE.Points(geometry,material);
    scene.add(particles);
    
}
galaxyGenerator();

gui.add(parameters,'count').min(100).max(100000).step(100).onFinishChange(galaxyGenerator);
gui.add(parameters,'size').min(0.01).max(0.1).step(0.01).onFinishChange(galaxyGenerator);
gui.add(parameters,'radius').min(1).max(10).step(1).onFinishChange(galaxyGenerator);
gui.add(parameters,'branches').min(2).max(10).step(1).onFinishChange(galaxyGenerator);
gui.add(parameters,'spin').min(-5).max(5).step(0.001).onFinishChange(galaxyGenerator);
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(galaxyGenerator);
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(galaxyGenerator);

gui.addColor(parameters,'insideColor').onFinishChange(galaxyGenerator);
gui.addColor(parameters,'outsideColor').onFinishChange(galaxyGenerator);
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 8
camera.position.z = 8
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update particles
    particles.rotation.y = elapsedTime / 2;
    // Update parameters
    // if(parameters.spin<5){
    //     parameters.spin += 0.01;
    //     galaxyGenerator();
    // } 

    // console.log(parameters.spin);

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()