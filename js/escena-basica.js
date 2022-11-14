/**
 * EscenaBasica.js
 *
 * Seminario GPC #2. Escena basica con geometrias predefinidas,
 * transformaciones y objetos importados
 */

// Modulos necesarios
import * as THREE from "three";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
// Variables de consenso
let renderer, scene, camera;

// Otras globales
let robot;
let brazo;
let angulo = 0;
// Acciones
init();
loadScene();
render();

function init()
{
    // Instanciar el motor
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth,window.innerHeight);
    document.getElementById('container').appendChild( renderer.domElement );

    // Instanciar la escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.5,0.5,0.5);

    // Instanciar la camara
    camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,1,2000);
    camera.position.set(0,200,170);
    camera.lookAt(0,120,0);
}

function loadScene()
{

    // init robot
    robot = new THREE.Object3D();
    // Material a utilizar
    const material = new THREE.MeshBasicMaterial({wireframe:true,color:'yellow'})
        

    // Suelo
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(1000,1000, 10,10), material );
    suelo.rotation.x = -Math.PI/2;

    // base
    const base = new THREE.Mesh( new THREE.CylinderGeometry( 50,50,15, 20 ) , material );
    base.position.y = 10;
    robot.add(base);

    //brazo
    brazo = new THREE.Object3D();
    const eje = new THREE.Mesh( new THREE.CylinderGeometry( 20,20,18, 20 ) , material );
    eje.rotation.x = -Math.PI/2;
    eje.position.y = -60;
    brazo.add(eje);

    const esparrago = new THREE.Mesh( new THREE.BoxGeometry(18,120,12), material );
    brazo.add(esparrago);

    const rotula = new THREE.Mesh( new THREE.SphereGeometry(20,10,10), material);
    rotula.position.y = 60;
    brazo.add(rotula);

    brazo.position.y = 70;
    robot.add(brazo);

    //antebrazo
    let antebrazo = new THREE.Object3D();
    const disco = new THREE.Mesh( new THREE.CylinderGeometry( 22,22,6, 20 ) , material );
    antebrazo.add(disco);

    let nervios = new THREE.Object3D();
    nervios.position.y = 40;

    let nervio_1 = new THREE.Mesh( new THREE.BoxGeometry(4,80,4), material );
    let nervio_2 = new THREE.Mesh( new THREE.BoxGeometry(4,80,4), material );
    let nervio_3 = new THREE.Mesh( new THREE.BoxGeometry(4,80,4), material );
    let nervio_4 = new THREE.Mesh( new THREE.BoxGeometry(4,80,4), material );

    nervio_1.position.x = 7;
    nervio_2.position.x = 7;
    nervio_3.position.x = -7;
    nervio_4.position.x = -7;

    nervio_1.position.z = 7;
    nervio_2.position.z = -7;
    nervio_3.position.z = 7;
    nervio_4.position.z = -7;

    nervios.add(nervio_1);
    nervios.add(nervio_2);
    nervios.add(nervio_3);
    nervios.add(nervio_4);

    antebrazo.add(nervios)

    const mano = new THREE.Mesh( new THREE.CylinderGeometry( 15,15,40, 20 ) , material );
    mano.rotation.x = -Math.PI/2;
    mano.position.y = 80;
    antebrazo.add(mano);

    antebrazo.position.y = 60;
    brazo.add(antebrazo);

    // pinzas

    const pinza_geometry = new THREE.BufferGeometry();

    const v_positions = new Float32Array([
        0,0,0, 19,20,0, 19,0,0, // T1
        0,0,0, 0,20,0, 19,20,0, // T2
        19,0,0, 19,20,0, 38,17,0, // T3
        38,3,0, 19,0,0, 38,17,0,// T4

        0,0,4, 19,0,4, 19,20,4, // T1_1
        0,0,4, 19,20,4, 0,20,4, // T2_1
        19,0,4, 38,17,2, 19,20,4, // T3_1
        38,3,2, 38,17,2, 19,0,4, // T4_1

        0,0,0,  19,0,0, 0,0,4, //S1
        0,0,4, 19,0,0, 19,0,4, //S2
        19,0,0, 38,3,0, 19,0,4, //S3
        19,0,4, 38,3,0, 38,3,2, //S4
        38,3,0, 38,17,0, 38,3,2, //S5
        38,17,0, 38,17,2, 38,3,2, //S6
        38,17,0, 19,20,0, 38,17,2, //S7
        38,17,2, 19,20,0, 19,20,4, //S8
        19,20,0, 0,20,0, 19,20,4, //S9
        19,20,4, 0,20,0, 0,20,4, //S10
        0,20,0, 0,0,0, 0,20,4, //S11
        0,0,0, 0,0,4, 0,20,4 //S12
    ]);

    const v_normals = new Float32Array([
        0,0,-1, 0,0,-1, 0,0,-1, //T1
        0,0,-1, 0,0,-1, 0,0,-1, //T2
        0,0,-1, 0,0,-1, 0,0,-1, //T3
        0,0,-1, 0,0,-1, 0,0,-1, //T4

        0,0,1, 0,0,1, 0,0,1, //T1_1
        0,0,1, 0,0,1, 0,0,1, //T2_1
        40,0,380, 40,0,380, 40,0,380, //T3_1  
        40,0,380, 40,0,380, 40,0,380, //T4_1

        0,-1,0, 0,-1,0, 0,-1,0, //S1
        0,-1,0, 0,-1,0, 0,-1,0, //S2
        1/19,-1/3,0, 1/19,-1/3,0, 1/19,-1/3,0, //S3
        1/19,-1/3,0, 1/19,-1/3,0, 1/19,-1/3,0, //S4
        1,0,0, 1,0,0, 1,0,0, //S5
        1,0,0, 1,0,0, 1,0,0, //S6
        1/19,1/3,0, 1/19,1/3,0, 1/19,1/3,0, //S7
        1/19,1/3,0, 1/19,1/3,0, 1/19,1/3,0, //S8
        0,1,0, 0,1,0, 0,1,0, //S9
        0,1,0, 0,1,0, 0,1,0, //S10
        -1,0,0, -1,0,0, -1,0,0, //S11
        -1,0,0, -1,0,0, -1,0,0, //S12
    ]);
    pinza_geometry.setAttribute('position', new THREE.BufferAttribute(v_positions,3));
    pinza_geometry.setAttribute('normal', new THREE.BufferAttribute(v_normals,3));


    const pinza = new THREE.Mesh(pinza_geometry,material);
    const pinza2 = pinza.clone();

    pinza.position.z = 10;
    pinza.position.y = 10;
    pinza.rotation.x = -Math.PI/2;
    mano.add(pinza);

    pinza2.position.z = -10;
    pinza2.position.y = -10;
    pinza2.rotation.x = Math.PI/2;
    mano.add(pinza2);

    scene.add(robot);
    scene.add(suelo);

}


function init_stl_model(stl_geometry, material)
{
    const mesh = new THREE.Mesh( stl_geometry, material );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh
}




function render()
{
    requestAnimationFrame(render);
    update();
    renderer.render(scene,camera);
}

function update()
{
    angulo += 0.003;
    robot.rotation.y = angulo;
}
