/**
 * EscenaBasica.js
 *
 * Seminario GPC #2. Escena basica con geometrias predefinidas,
 * transformaciones y objetos importados
 */

// Modulos necesarios
import * as THREE from "../lib/three.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import {OrbitControls} from "../lib/OrbitControls.module.js";

// Variables de consenso
let renderer, scene, camera, cameraControls;

// Otras globales
let robot;
let brazo;
let angulo = 0;


//camaras adicionales
let L = 100;
let alzado, planta,perfil;

// Acciones
init();
loadScene();
render();

function init()
{
    // Instanciar el motor
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.setClearColor(new THREE.Color(0.5,0.5,0.5));
    document.getElementById('container').appendChild( renderer.domElement );
    renderer.autoClear = false;


    // Instanciar la escena
    scene = new THREE.Scene();
    //scene.background = new THREE.Color(0.5,0.5,0.5);

    const ar = window.innerWidth / window.innerHeight;
    // Instanciar la camara
    //camera = new THREE.OrthographicCamera(-2*ar,2*ar,2,-2,1,1000);
    camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,1,500);

    setCameras(ar);
    camera.position.set(0,200,170);
    
    cameraControls = new OrbitControls( camera, renderer.domElement);
    cameraControls.minDistance = 30;
    cameraControls.maxDistance = 400;
    cameraControls.target.set(0,120,0);
    camera.lookAt(0,120,0);

    //captura de eventos
    window.addEventListener("resize", updateAspectRatio);
}

function loadScene()
{

    // init robot
    robot = new THREE.Object3D();
    // Material a utilizar
    const material = new THREE.MeshNormalMaterial({wireframe:false,flatShading:true})
        

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

function render()
{
    requestAnimationFrame(render);
    
    //Borrar una unica vez
    renderer.clear();

    let tamaño_cenital = window.innerHeight < window.innerWidth ? window.innerHeight / 4 : window.innerWidth / 4;

    // repartir el canvas en 4 viewports con la misma relación de aspecto
    renderer.setViewport(0, window.innerHeight-tamaño_cenital,tamaño_cenital,tamaño_cenital);
    renderer.render(scene,planta);


    renderer.setViewport(0,0,window.innerWidth,window.innerHeight);
    renderer.render(scene,camera);

    
}

function update()
{
    angulo += 0.003;
    robot.rotation.y = angulo;
}

function updateAspectRatio()
{
    renderer.setSize(window.innerWidth , window.innerHeight)
    const ar = window.innerWidth / window.innerHeight;

    // actualizar la vista de la camara perspectiva
    camera.aspect = ar;
    camera.updateProjectionMatrix();


    //Actualizar la vista de las cámaras ortograficas
    if( ar < 1)
    {
        planta.left =-L;
        planta.right = L;
        planta.top  = -L;
        planta.bottom = -L;
    } else {
        planta.left =-L;
        planta.right = L;
        planta.top  = L;
        planta.bottom = -L;
    }

    planta.updateProjectionMatrix();
}

function setCameras(ar)
{
    let camaraOrtografica;
    if( ar < 1 ) {
        camaraOrtografica = new THREE.OrthographicCamera(-L , L , L, -L, 1, 400);
    } else {
        camaraOrtografica = new THREE.OrthographicCamera( -L, L, L, -L , 1, 400);
    }

    //planta
    planta = camaraOrtografica.clone();
    planta.position.set(0,3*L,0)
    planta.lookAt(0,0,0)
    planta.up = new THREE.Vector3(0,0,-1);

}