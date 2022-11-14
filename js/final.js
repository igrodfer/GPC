/**
 * EscenaBasica.js
 *
 * Seminario GPC #2. Escena basica con geometrias predefinidas,
 * transformaciones y objetos importados
 */

// Modulos necesarios
import * as THREE from "three";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import { AxesHelper } from "three";
import {OrbitControls} from "../lib/OrbitControls.module.js";
import {TWEEN} from "../lib/tween.module.min.js"
import GUI from '../lib/lil-gui.module.min.js'


class PickHelper {
    constructor(camera,domElement,container,scene) {
        this.domElement = domElement
        this.enabled = true;
        this.pointerUpCallback = (value) => {}

        this._getPointer = getPointer.bind( this );
		this._onPointerDown = onPointerDown.bind( this );
		this._onPointerMove = onPointerMove.bind( this );
		this._onPointerUp = onPointerUp.bind( this );
        this._plane = new THREE.Object3D();
        let dummy = new THREE.Mesh(new THREE.PlaneGeometry(2000,2000,200,200),new THREE.MeshBasicMaterial( {
            visible: false,
            wireframe: true,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.1,
            toneMapped: false
        } ) );
        dummy.position.y = 2;
        dummy.rotation.x = Math.PI/2
        dummy.name="Plano de movimiento"
        this._plane.add(dummy)
        this._plane.name = "_PLANE"
        scene.add(this._plane)
        this.translationSnap = true;
        this.translationSnapScaleX = 0;
        this.translationSnapScaleZ = 0;
        this.translationSnapOffsetX = 0;
        this.translationSnapOffsetZ = 0;
		this.domElement.addEventListener( 'pointerdown', this._onPointerDown );

		this.domElement.addEventListener( 'pointerup', this._onPointerUp );
		this.domElement.addEventListener( 'touchend', this._onPointerUp );

        this._offset = new THREE.Vector3();
        this._positionStart = new THREE.Vector3();
        this.worldPositionStart = new THREE.Vector3();
        this.worldRotationStart = new THREE.Vector3();
        this.worldScaleStart = new THREE.Vector3();
        this.pointStart = new THREE.Vector3();
        this.pointEnd = new THREE.Vector3();
        this.raycaster = new THREE.Raycaster();
        this.camera = camera
        this.movables = container
        this.team = 0;
        
    }
    setPointerUpHandler(callback) {
        this.pointerUpCallback = callback;
    }

	pointerDown( pointer ) {
		if ( this.dragging === true || pointer.button !== 0 ) return;

		if ( this.axis !== null ) {

			_raycaster.setFromCamera( pointer, this.camera );
			const intersected_object = intersectObjectWithRay( this.movables, _raycaster, true );

			if ( intersected_object) {
                
                this.object = intersected_object.object.parent;
                this.saved_texture = this.object.children[0].material;
                this.object.children.forEach(cara => {
                    cara.material = new THREE.MeshPhongMaterial({color:'black'})
                });
                this.object.material = new THREE.MeshPhongMaterial({color:'black'})
                this.object.updateMatrixWorld();
				this.object.parent.updateMatrixWorld();

				this._positionStart.copy( this.object.position );

				this.worldPositionStart.setFromMatrixPosition(this.object.matrixWorld);

				this.pointStart.copy( intersected_object.point ).sub( this.worldPositionStart );
                this.dragging = true;

			}

		}

	}

    
	pointerMove( pointer ) {

		const object = this.object;

		if ( object == null || this.dragging === false || (pointer.button !== - 1 && pointer.button.isTouch)) return;
		_raycaster.setFromCamera( pointer, this.camera );

		const planeIntersect = intersectObjectWithRay( this._plane, _raycaster, true );

		if ( ! planeIntersect ) return;
		this.pointEnd.copy( planeIntersect.point ).sub( this.worldPositionStart );
        // Apply translate
        this._offset.copy( this.pointEnd ).sub( this.pointStart );
        this._offset.y = 0;

        object.position.copy( this._offset ).add( this._positionStart );


	}

    pointerUp( pointer ) {
		if ( pointer.button !== 0 || ! this.dragging) return;
        this.object.material = this.saved_texture;
        var dropped_at = new THREE.Vector3()
        this.object.children.forEach(cara => {
            cara.material = this.saved_texture;
        });
        this.object.center.getWorldPosition(dropped_at);
        if(!is_valid_place(dropped_at))
        {
            this.object.position.x = this._positionStart.x;
            this.object.position.y = this._positionStart.y;
            this.object.position.z = this._positionStart.z;
        }
        this.pointerUpCallback(this.object);
        this.object = null;

		this.dragging = false;
	}

}

// Variables de consenso
let renderer, scene, camera, move_controls,camera_orth,camera_persp,cameraControls;
let camera_state = 0;
// Otras globales
let tablero, material,pieces,turno;
let L = 25;
let skybox;
let _raycaster = new THREE.Raycaster();
let material_blancas,material_negras,lista_materiales;
let valid_places = {};
let enable_camera_move= true;
let background = {
    'Berzelii':'BerzeliiPark',
    'Buddha':'Buddha',
    'Torre CN':'CNTower2',
    'Fatburs':'Fatbursparken',
    'Niagara 1':'NiagaraFalls1',
    'Niagara 2':'NiagaraFalls2',
    'Niagara 3':'NiagaraFalls3',
    'Parque':'Park',
    'Parque 2':'Park2',
    'Camino':'Path',
    'Lago':'Pond',
    'Skansen 1':'Skansen',
    'Skansen 2':'Skansen2',
    'Skansen 3':'Skansen3',
    'Skansen 4':'Skansen4',
    'Skansen 5':'Skansen5',
    'Tantolunden 1':'Tantolunden',
    'Tantolunden 2':'Tantolunden3',
    'Tantolunden 3':'Tantolunden4',
}
var o_helper;
// Acciones
init();
init_cameras();
loadScene();
render();
init_gui();
init_controls();
function onDropPiece(piece)
{

}

function init_controls(free_camera){
    move_controls = new PickHelper(camera,renderer.domElement,pieces,scene)
    move_controls.pointerUpCallback = onDropPiece
    if(!true) {
        cameraControls = new OrbitControls( camera_persp, renderer.domElement);
        cameraControls.minDistance = 10;
        cameraControls.maxDistance = 100;
        cameraControls.target.set(20,0,20);
        camera.lookAt(0,0,0)
    }
}

//scene.add(move_controls._plane)
function init_cameras() 
{
    const ar = window.innerWidth / window.innerHeight;

    // Instanciar la camara
    camera_persp = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,1,500);
    camera_persp.position.set(20,50,50);
    camera_persp.lookAt(20,0,20);

    if( ar < 1 ) {
        camera_orth = new THREE.OrthographicCamera(-L , L , L/ar, -L/ar, 0.5,40);
    } else {
        camera_orth = new THREE.OrthographicCamera( -L*ar, L*ar, L, -L ,0.5,300);
    }
    
    camera_orth.position.set(20,20,20)
    camera_orth.lookAt(20,0,20)
    camera_orth.up = new THREE.Vector3(0,0,1);

    o_helper = new THREE.CameraHelper(camera_orth);
    //scene.add(o_helper)

    camera = camera_persp;
}
function init_board()
{
    
    valid_places.tablero = {
        x: {
            max: 40,
            min:0,
        },
        z: {
            max:40,
            min:0
        }
    }

    const loader = new THREE.TextureLoader();

    let top_texture_map = loader.load( './textures/tablero.jpg');
    let side_texture_map = loader.load( './textures/tablero_lado.jpg');
    top_texture_map.minFilter = THREE.LinearFilter;
    side_texture_map.minFilter = THREE.LinearFilter;

    const top_tablero_material = new THREE.MeshLambertMaterial( { map: top_texture_map } );
    const side_tablero_material = new THREE.MeshLambertMaterial( { map: side_texture_map } );

    // Tablero
    tablero = new THREE.Object3D();
    let top_plane = new THREE.Mesh( new THREE.PlaneGeometry(40,40,10,10), top_tablero_material );
    let lateral = new THREE.Mesh( new THREE.PlaneGeometry(1,40,10,10), side_tablero_material );

    top_plane.castShadow = true;
    top_plane.receiveShadow = true;

    lateral.castShadow = true;
    lateral.receiveShadow = true;

    top_plane.position.y = 1;
    top_plane.rotation.x = -Math.PI/2;

    let bottom_plane = top_plane.clone()
    bottom_plane.rotation.x = Math.PI/2;
    bottom_plane.position.y = 0.1;

    lateral.position.y = 0.5;
    lateral.rotation.z = -Math.PI/2;

    let lateral2 = lateral.clone();
    let lateral3 = lateral.clone();
    let lateral4 = lateral.clone();

    lateral.position.z = 20;
    lateral2.rotation.y = Math.PI/2;
    lateral2.position.x = 20;
    lateral3.rotation.y = Math.PI;
    lateral3.position.z = -20
    lateral4.rotation.y = -Math.PI/2;
    lateral4.position.x = -20;

    tablero.position.x = 20;
    tablero.position.z = 20;


    tablero.add(top_plane);
    tablero.add(bottom_plane)
    tablero.add(lateral);
    tablero.add(lateral2);
    tablero.add(lateral3);
    tablero.add(lateral4);

    scene.add(tablero);
    
    tablero.receiveShadow = true;
    tablero.castShadow = true;

    let d_place  = {
        x:{
            max:55,
            min:45,
        },
        z:{
            max:30,
            min:10
        }
    }
    material = get_textured_material('wood_019')
    material.displacementMap = null;
    let deposito = new THREE.Mesh( new THREE.BoxGeometry(d_place.x.max-d_place.x.min,2,d_place.z.max-d_place.z.min), material)
    deposito.castShadow = true;
    deposito.receiveShadow= true;
    deposito.position.set((d_place.x.min + d_place.x.max)/2,0,(d_place.z.min + d_place.z.max)/2)
    scene.add(deposito)
    valid_places.deposito = d_place
}

function rotar_camara_persp()
{
    let p = {
        x: camera_persp.position.x,
        z: camera_persp.position.z
    }
    if (camera_state == 0) 
    {
        var steps = {
            x: [40.0,20.0],
            z: [-10.0]
        }
        camera_state = 1;
    } else {
        var steps = {
            x: [0.0,20.0],
            z: [50.0]
        }
        camera_state = 0;
    }
    var animador = new TWEEN.Tween(p)
        .to(steps,1000)
        .interpolation(TWEEN.Interpolation.Bezier)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate((value) => {
            camera_persp.position.x = value.x;
            camera_persp.position.z = value.z;
            camera_persp.lookAt(20,0,20);
        })
        .start()    
}

function mirar_alrededor()
{
    if (camera != camera_persp) return;
    enable_camera_move = false
    let p = {
        x:20,
        y:0,
        z:20
    }
    var steps = {
        x : [-20,-20,20,40,40,20],
        y: [50,50,50,0]
    }
    var animador = new TWEEN.Tween(p)
        .to(steps,10000)
        .interpolation(TWEEN.Interpolation.CatmullRom)
        .easing(TWEEN.Easing.Sinusoidal.InOut)
        .onUpdate((value) => {
            camera_persp.lookAt(value.x,value.y,20);
        })
        .onComplete(() => {enable_camera_move=true})
        .start()
}

function pensar() 
{
    if (camera != camera_persp) return;
    enable_camera_move = false;
    let p = {
        x:20,
        y:0,
        z:20,
        v:camera.up.x
    }

    var steps_subir = {
        x : [0],
        y: [50,100,120],
        v: [0.25,0.4]
    }

    let steps_bajar = {
        x : [20],
        y: [100,50,0],
        v: [0.25,camera.up.x]
    }
    var animador_subida = new TWEEN.Tween(p)
        .to(steps_subir,1000)
        .interpolation(TWEEN.Interpolation.CatmullRom)
        .easing(TWEEN.Easing.Cubic.In)
        .onUpdate((value) => {
            camera_persp.lookAt(value.x,value.y,20);
            camera.up.x = value.v
        })
    var animador_pensar = new TWEEN.Tween(p)
        .to(steps_subir,Math.random()*10000+5000)
    var animador_bajar = new TWEEN.Tween(p)
        .to(steps_bajar,1000)
        .interpolation(TWEEN.Interpolation.CatmullRom)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onUpdate((value) => {
            camera_persp.lookAt(value.x,value.y,20);
            camera.up.x = value.v
            camera_persp.lookAt(value.x,value.y,20);
        }).onComplete(() => {enable_camera_move=true})
        
    animador_subida.chain(animador_pensar)
    animador_pensar.chain(animador_bajar)
    animador_subida.start()
}
function init_gui()
{
    const gui = new GUI({title:'Controles'});

    var gui_control = {
        next: () => {
            if(enable_camera_move) {
                turno = (turno +1) % 2;
                rotar_camara_persp();
                move_controls.team = turno;
            }
        },
        ortho: false,
        fondo: background.Parque,
        fichas: lista_materiales.madera,
        look: () => {
            if(enable_camera_move) {
                mirar_alrededor();
            }
        },
        think: () => {
            if(enable_camera_move) {
                pensar();
            }
        }
    };

    gui.add(gui_control,'next')
        .name('Siguiente');
    const appearance_folder = gui.addFolder('Estilos');
    appearance_folder.close()
    appearance_folder.add(gui_control,'ortho')
        .name('Vista superior')
        .onChange( value => {
            if ( value ) {
                camera = camera_orth;
            }
            else {
                camera = camera_persp;
            }
            move_controls.camera = camera;
        });
    appearance_folder.add(gui_control,'fondo',background,background["Skansen 3"])
        .name("Fondo")
        .onChange((value) => {
            change_background(value);
        })
    appearance_folder.add(gui_control,'fichas',lista_materiales)
        .name("Material Piezas")
        .onChange( value => {
            actualizar_materiales(value);
        })

    const misc_folder = gui.addFolder('Misceláneo')
    misc_folder.add(gui_control,'look')
        .name("Mirar alrededor")
    misc_folder.add(gui_control,'think')
        .name("Pensar")

    misc_folder.close()
}

function init_skybox(path)
{
    const sky_size = 300;
    skybox = new THREE.Mesh(new THREE.BoxGeometry(sky_size,sky_size,sky_size), new THREE.MeshBasicMaterial({side:THREE.BackSide}))
    skybox.position.set(20,0,20 );
    scene.add(skybox);
    change_background(path);
}

function change_background(path_b) 
{
    var t_loader = new THREE.TextureLoader()
    var path = './textures/park-skyboxes/'+path_b+'/'
    if ( Array.isArray( skybox.material ) ) {
        skybox.material[0].map = t_loader.load(path+'posx.jpg')
        skybox.material[1].map = t_loader.load(path+'negx.jpg')
        skybox.material[2].map = t_loader.load(path+'posy.jpg')
        skybox.material[3].map = t_loader.load(path+'negy.jpg')
        skybox.material[4].map = t_loader.load(path+'posz.jpg')
        skybox.material[5].map = t_loader.load(path+'negz.jpg')
    } else {
        var materials = [
            new THREE.MeshBasicMaterial({side:THREE.BackSide,map:t_loader.load(path+'posx.jpg')}),
            new THREE.MeshBasicMaterial({side:THREE.BackSide,map:t_loader.load(path+'negx.jpg')}),
            new THREE.MeshBasicMaterial({side:THREE.BackSide,map:t_loader.load(path+'posy.jpg')}),
            new THREE.MeshBasicMaterial({side:THREE.BackSide,map:t_loader.load(path+'negy.jpg')}),
            new THREE.MeshBasicMaterial({side:THREE.BackSide,map:t_loader.load(path+'posz.jpg')}),
            new THREE.MeshBasicMaterial({side:THREE.BackSide,map:t_loader.load(path+'negz.jpg')}),
        ]
        skybox.material = materials;    
    }

    load_materiales(path);

}
function init()
{
    // Instanciar el motor
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.antialias = true
    document.getElementById('container').appendChild( renderer.domElement );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Instanciar la escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.5,0.5,0.5);

    //captura de eventos
    window.addEventListener("resize", updateAspectRatio);
    turno = 0;
}


function init_white_pieces(pieces){
    material_blancas = lista_materiales.madera.blancas
    material_blancas.name = 'Blanco'
    //Blancas 
    let rey_blanco = init_gltf_model('./models/rey.gltf',material_blancas);
    var [x,y] = piece_coordinates_helper('e',1);
    rey_blanco.position.set(x,1,y)
    rey_blanco.name="Rey blanco"
    rey_blanco.team = 0
    pieces.add(rey_blanco)

    var [x,y] = piece_coordinates_helper('d',1);
    let dama_blanca = init_gltf_model('./models/dama.gltf',material_blancas);
    dama_blanca.position.set(x,1,y)
    dama_blanca.name="Dama Blanca"
    dama_blanca.team = 0
    pieces.add(dama_blanca)

    for(let i = 1; i <= 8; i++)
    {   
        let peon_blanco = init_gltf_model('./models/peon.gltf',material_blancas);
        var col = String.fromCharCode(96 + i); 
        [x,y] = piece_coordinates_helper(col,2);
        peon_blanco.position.set(x,1,y)
        peon_blanco.name = "peon Blanco " + i;
        peon_blanco.team = 0;
        pieces.add(peon_blanco);

    }

    var [x,y] = piece_coordinates_helper('c',1);
    let alfil_blanco1 = init_gltf_model('./models/alfil.gltf',material_blancas);
    alfil_blanco1.position.set(x,1,y)
    alfil_blanco1.name = "Alfil blanco 1"
    alfil_blanco1.team = 0;
    pieces.add(alfil_blanco1)

    var [x,y] = piece_coordinates_helper('f',1);
    let alfil_blanco2 = init_gltf_model('./models/alfil.gltf',material_blancas);
    alfil_blanco2.position.set(x,1,y)
    alfil_blanco2.name = "Alfil blanco 2";
    alfil_blanco2.team = 0;
    pieces.add(alfil_blanco2)

    var [x,y] = piece_coordinates_helper('b',1);
    let caballo_blanco_1 = init_gltf_model('./models/caballo.gltf',material_blancas);
    caballo_blanco_1.position.set(x,1,y)
    caballo_blanco_1.name = "Caballo blanco 1"
    caballo_blanco_1.team = 0;
    pieces.add(caballo_blanco_1)

    var [x,y] = piece_coordinates_helper('g',1);
    let caballo_blanco_2 = init_gltf_model('./models/caballo.gltf',material_blancas);
    caballo_blanco_2.position.set(x,1,y)
    caballo_blanco_2.name = "Caballo blanco 2"
    caballo_blanco_2.team = 0;
    pieces.add(caballo_blanco_2)

    var [x,y] = piece_coordinates_helper('a',1);
    let torre_blanca_1 = init_gltf_model('./models/torre.gltf',material_blancas);
    torre_blanca_1.position.set(x,1,y)
    torre_blanca_1.name = "Torre blanca 1"
    torre_blanca_1.team = 0
    pieces.add(torre_blanca_1)

    var [x,y] = piece_coordinates_helper('h',1);
    let torre_blanca_2 = init_gltf_model('./models/torre.gltf',material_blancas);
    torre_blanca_2.position.set(x,1,y)
    torre_blanca_2.name = "Torre blanca 2"
    torre_blanca_2.team = 0
    pieces.add(torre_blanca_2)
}

function init_black_pieces(pieces){
    material_negras = lista_materiales.madera.negras

    //Blancas 
    let rey_negro = init_gltf_model('./models/rey.gltf',material_negras);
    var [x,y] = piece_coordinates_helper('e',8);
    rey_negro.position.set(x,1,y)
    rey_negro.team = 1;
    pieces.add(rey_negro)

    var [x,y] = piece_coordinates_helper('d',8);
    let dama_negra = init_gltf_model('./models/dama.gltf',material_negras);
    dama_negra.position.set(x,1,y)
    dama_negra.team = 1;
    pieces.add(dama_negra)

    for(let i = 1; i <= 8; i++)
    {   
        let peon_negro = init_gltf_model('./models/peon.gltf',material_negras);
        var col = String.fromCharCode(96 + i); 
        [x,y] = piece_coordinates_helper(col,7);
        peon_negro.position.set(x,1,y)
        peon_negro.team = 1;
        pieces.add(peon_negro)
    }

    var [x,y] = piece_coordinates_helper('c',8);
    let alfil_negro1 = init_gltf_model('./models/alfil.gltf',material_negras);
    alfil_negro1.position.set(x,1,y)
    alfil_negro1.team = 1;
    pieces.add(alfil_negro1)

    var [x,y] = piece_coordinates_helper('f',8);
    let alfil_negro2 = init_gltf_model('./models/alfil.gltf',material_negras);
    alfil_negro2.position.set(x,1,y)
    alfil_negro2.team = 1;
    pieces.add(alfil_negro2)

    var [x,y] = piece_coordinates_helper('b',8);
    let caballo_negro1 = init_gltf_model('./models/caballo.gltf',material_negras);
    caballo_negro1.position.set(x,1,y)
    caballo_negro1.team = 1;

    pieces.add(caballo_negro1)

    var [x,y] = piece_coordinates_helper('g',8);
    let caballo_negro2 = init_gltf_model('./models/caballo.gltf',material_negras);
    caballo_negro2.position.set(x,1,y)
    caballo_negro2.team = 1

    pieces.add(caballo_negro2)

    var [x,y] = piece_coordinates_helper('a',8);
    let torre_negra1 = init_gltf_model('./models/torre.gltf',material_negras);
    torre_negra1.position.set(x,1,y)
    torre_negra1.team = 1
    pieces.add(torre_negra1)

    var [x,y] = piece_coordinates_helper('h',8);
    let torre_negra2 = init_gltf_model('./models/torre.gltf',material_negras);
    torre_negra2.position.set(x,1,y)
    torre_negra2.team = 1
    pieces.add(torre_negra2)
}

function actualizar_materiales(tipo)
{
    pieces.children.forEach(pieza => {
        let team = pieza.team
        pieza = pieza.children[0]
        pieza.children.forEach(cara => {
            if( team == 0 )
            {
                cara.material = tipo.blancas
            } else {
                cara.material = tipo.negras;
            }
        });
        
    });
}
function init_lights() 
{
    const foco = new THREE.PointLight( 0xffffbb, 0.6 );
    foco.position.set(40,30,40)
    foco.castShadow = true
    const helper = new THREE.PointLightHelper(foco)
    foco.shadow.mapSize.height = 500
    foco.shadow.mapSize.width = 500
    foco.shadow.camera.far = 100;
    foco.shadow.camera.near = 4;

    //scene.add(helper)
    scene.add( foco );

    const ambiente = new THREE.AmbientLight(0xffffbb, 0.4 )
    scene.add(ambiente)
}

function load_materiales(cube_path){
    let loader = new THREE.TextureLoader()
    let c_loader = new THREE.CubeTextureLoader()
    lista_materiales = {}

    //Básico madera
    var t = loader.load('./images/wood512.jpg')
    let material_madera_negras = new THREE.MeshPhongMaterial({map:t,color:0x1a1818,specular:0x422006})
    let material_madera_blancas = new THREE.MeshPhongMaterial({map:t,color:0xd4bb7e})

    lista_materiales.madera = {blancas:material_madera_blancas,negras:material_madera_negras}


    var t = loader.load('./images/metal_128.jpg')
    var env = c_loader.load([cube_path+'posx.jpg',cube_path+'negx.jpg',
                             cube_path+'posy.jpg',cube_path+'negy.jpg',
                             cube_path+'posz.jpg',cube_path+'negz.jpg'])

    let white = 0x71797E
    let metalico_brillante_blancas = new THREE.MeshPhongMaterial({color:0xffffff,map:t,
                                        shininess:1000,specular:0xfffffff,envMap:env})
    let metalico_brillante_negras = new THREE.MeshPhongMaterial({color:0x1F2022,map:t,
                                        shininess:300,specular:0x1F2022,envMap:env})
    lista_materiales.metal_brillo = {blancas:metalico_brillante_blancas,negras:metalico_brillante_negras}

    var t = loader.load("./textures/metal_gold_001/basecolor.jpg")
    var ao = loader.load("./textures/metal_gold_001/ambientOcclusion.jpg")
    var height = loader.load("./textures/metal_gold_001/height.png")
    var normal = loader.load("./textures/metal_gold_001/normal.jpg")
    var metal = loader.load("./textures/metal_gold_001/metallic.jpg")

    let preciado_blancas = new THREE.MeshPhongMaterial({map:t,normalMap:normal,
                                        bumpMap:height,aoMap:ao,
                                        shininess:100,specular:0xfffffff,specularMap:metal,envMap:env})
    var t = loader.load('./images/metal_128.jpg')
    let preciado_negras = new THREE.MeshPhongMaterial({color:0xffffff,map:t,
                                        shininess:1000,specular:0xfffffff,envMap:env})
    lista_materiales.metal_preciado = {blancas:preciado_blancas,negras:preciado_negras}

}
function loadScene()
{

    let concrete_material = get_textured_material('concrete_018')
    // Suelo
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(80,80, 10,10), concrete_material );
    suelo.position.set(20,0,20);
    suelo.rotation.x = -Math.PI/2;
    suelo.receiveShadow = true
    suelo.castShadow = true

    material = new THREE.MeshPhongMaterial({color:'blue'})

    let cubo_test = new THREE.Mesh(new THREE.CylinderGeometry(4.1/2,4.1/2,4.1), material)
    cubo_test.add(new AxesHelper(5))
    let [x,y] = piece_coordinates_helper('d',4);

    cubo_test.position.set(x,1,y)
    cubo_test.position.x += 4.1/2
    cubo_test.position.z += 4.1/2
    cubo_test.receiveShadow = true
    cubo_test.castShadow = true
    //scene.add(cubo_test)

    load_materiales('./textures/park-skyboxes/Park/')
    init_skybox('Skansen3');
    init_lights();
    pieces = new THREE.Object3D();
    pieces.name = "Pieces Container"
    init_white_pieces(pieces);
    init_black_pieces(pieces);
    init_board();
    scene.add(pieces)
    scene.add(suelo)
}

function init_gltf_model(path, material,name)
{       
    var res = new THREE.Object3D();
    const loader = new GLTFLoader();
    let marker = new THREE.Object3D()
    
    loader.load( path, function ( board_scene ) {
        let piece = board_scene.scene.children[0]

        piece.children.forEach(element => {
            element.material = material
            element.castShadow = true;
            element.receiveShadow = true;
        });
        scene.add(piece)
        piece.add(marker)
        piece.center = marker;
        piece.scale.set(0.8,0.8,0.8)
        res.add(piece)
        piece.position.set( 0,0,0 );

    });

    return res;
}

function get_textured_material(texture_path)
{
    const t_loader = new THREE.TextureLoader();
    var color = t_loader.load('./textures/'+texture_path+'/BaseColor.jpg')
    var height = t_loader.load('./textures/'+texture_path+'/Height.png')
    var normal = t_loader.load('./textures/'+texture_path+'/Normal.jpg')
    var rough = t_loader.load('./textures/'+texture_path+'/Roughness.jpg')
    var ao = t_loader.load('./textures/'+texture_path+'/AmbientOcclusion.jpg')

    return new THREE.MeshStandardMaterial({map:color,bumpMap:height,
                                                            normalMap:normal,displacementMap:height,
                                                            aoMap:ao,roughnessMap:rough})
}

function piece_coordinates_helper(column, row_code)
{   
    let column_code = column.charCodeAt(0) - 'a'.charCodeAt(0)
    let x_position = 5.4 + column_code * 4.18;
    let y_position = 5.7 + (8- row_code) * 4.15;
    
    return [x_position,y_position]
}

function render()
{
    requestAnimationFrame(render);
    update();
    renderer.render(scene,camera);
}

function update()
{
    TWEEN.update();
}

function updateAspectRatio()
{
    renderer.setSize(window.innerWidth , window.innerHeight)
    const ar = window.innerWidth / window.innerHeight;

    // actualizar la vista de la camara perspectiva
    camera_persp.aspect = ar;
    camera_persp.updateProjectionMatrix();


    //Actualizar la vista de las cámaras ortograficas
    if( ar < 1)
    {
        camera_orth.left =-L;
        camera_orth.right = L;
        camera_orth.top  = L/ar;
        camera_orth.bottom = -L/ar;
    } else {
        camera_orth.left =-L*ar;
        camera_orth.right = L*ar;
        camera_orth.top  = L;
        camera_orth.bottom = -L;
    }

    camera_orth.updateProjectionMatrix();
}


function getPointer( event ) {

	if ( this.domElement.ownerDocument.pointerLockElement ) {
        
		return {
			x: 0,
			y: 0,
			button: event.button
		};
    } else if (event.changedTouches != null) {
        const rect = this.domElement.getBoundingClientRect();
        return {
			x: (event.changedTouches[0].clientX- rect.left ) / rect.width * 2 - 1,
			y: - ( event.changedTouches[0].clientY - rect.top ) / rect.height * 2 + 1,
			button: 0,
            isTouch: true
		};
    } else {

		const rect = this.domElement.getBoundingClientRect();
		return {
			x: ( event.clientX - rect.left ) / rect.width * 2 - 1,
			y: - ( event.clientY - rect.top ) / rect.height * 2 + 1,
			button: event.button
		};

	}

}


function onPointerDown( event ) {

	if ( ! this.enabled ) return;

	if ( ! document.pointerLockElement ) {
		this.domElement.setPointerCapture( event.pointerId );
	}

	this.domElement.addEventListener( 'pointermove', this._onPointerMove );
	this.domElement.addEventListener( 'touchmove', this._onPointerMove );

	this.pointerDown( this._getPointer( event ) );

}

function onPointerMove( event ) {

	if ( ! this.enabled ) return;

    this.pointerMove( this._getPointer( event ) );

}

function onPointerUp( event ) {

	if ( ! this.enabled ) return;

    if (event.target.hasPointerCapture(event.pointerId)) {
        this.domElement.releasePointerCapture( event.pointerId );
    }

	this.domElement.removeEventListener( 'pointermove', this._onPointerMove );
	this.domElement.removeEventListener( 'touchmove', this._onPointerMove );

	this.pointerUp( this._getPointer( event ) );

}

function intersectObjectWithRay( object, raycaster, includeInvisible ) {
	const allIntersections = raycaster.intersectObject( object, true );
	for ( let i = 0; i < allIntersections.length; i ++ ) {

		if ( allIntersections[ i ].object.visible || includeInvisible ) {

			return allIntersections[ i ];

		}

	}

	return false;

}

function is_valid_place(place)
{
    let res = false;

    for(const [name,constraints] of Object.entries(valid_places))
    {
        let c_x = constraints.x;
        let c_z = constraints.z;

        let val_x = (place.x >= c_x.min) && (place.x <= c_x.max)
        let val_z = (place.z >= c_z.min) && (place.z <= c_z.max)

        res = val_x && val_z
   
        if( res ) break;
    }
    return res;
}