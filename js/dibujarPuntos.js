/*
    Seminario #1: Dibujar puntos con VBOs
*/

// Shader de vertices
const VSHADER_SOURCE = `
    attribute vec3 posicion;
    attribute vec3 vertexColor;
    varying highp vec4 vColor;

    void main(){
        gl_Position = vec4(posicion,1.0);
        gl_PointSize = 10.0;
        vColor = vec4(vertexColor,1.0);
    }
`
// Shader de fragmentos
const FSHADER_SOURCE = `
    varying highp vec4 vColor;
    void main(){
        gl_FragColor = vColor;
    }
`
// Globales
const clicks = [];
const colors = [];
let colorFragmento;
let coordenadas = null;
let colores = null;
function main()
{
    // Recupera el lienzo
    const canvas = document.getElementById("canvas");
    const gl = getWebGLContext( canvas );

    // Cargo shaders en programa de GPU
    if(!initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)){
        console.log("La cosa no va bien");
    }

    // Color de borrado del lienzo
    gl.clearColor(0.0, 0.0, 0.3, 1.0);

    // Localiza el att del shader posicion y color
    coordenadas = gl.getAttribLocation( gl.program, 'posicion');
    colores = gl.getAttribLocation(gl.program, 'vertexColor');

    // Crea buffer, bindea buffer  ...
    const bufferVertices = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferVertices );
    gl.vertexAttribPointer( coordenadas, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( coordenadas );

    const bufferColores = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferColores);
    gl.vertexAttribPointer(colores, 3,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(colores);

    // Registrar la call-back del click del raton
    canvas.onmousedown = function(evento){ click(evento,gl,canvas); };

    // Dibujar
    render( gl );

}

function click( evento, gl, canvas )
{
    // Recuperar la posicion del click
    // El click devuelve la x,y en el sistema de referencia
    // del documento. Los puntos que se pasan al shader deben
    // de estar en el cuadrado de lado dos centrado en el canvas

    let x = evento.clientX;
    let y = evento.clientY;
    const rect = evento.target.getBoundingClientRect();

    // Conversion de coordenadas al sistema webgl por defecto
    x = ((x-rect.left)-canvas.width/2) * 2/canvas.width;
    y = ( canvas.height/2 - (y-rect.top)) * 2/canvas.height;

    dist = 1-(Math.abs(x)+Math.abs(y))/2;
    dist = 1-Math.sqrt(x*x + y*y)/Math.sqrt(2);
	// Guardar las coordenadas y copia el array
	clicks.push(x); clicks.push(y); clicks.push(0.0);
  colors.push(dist);
  colors.push(dist);
  colors.push(dist);
	// Redibujar con cada click
	render( gl );
}

function render( gl )
{
	// Borra el canvas con el color de fondo
	gl.clear( gl.COLOR_BUFFER_BIT );

	// Fija el color de TODOS los puntos
	//gl.uniform3f(colorFragmento, 1, 1, 1);

	// Rellena el BO activo con las coordenadas y lo manda a proceso

  const bufferVertices = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, bufferVertices );
  gl.vertexAttribPointer( coordenadas, 3, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( coordenadas );
  gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(clicks), gl.STATIC_DRAW );


  const bufferColores = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferColores);
  gl.vertexAttribPointer(colores, 3,gl.FLOAT,false,0,0);
  gl.enableVertexAttribArray(colores);
  gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW );
  gl.drawArrays( gl.VERTICES, 0, clicks.length/3 )

  gl.uniform3f(colorFragmento, 1, 1, 0);
  gl.drawArrays( gl.LINE_STRIP, 0, clicks.length/3 )
}
