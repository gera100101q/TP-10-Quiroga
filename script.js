/* =========================================================
   TP10 — Asteroides
   script.js — lógica del juego con HTML5 Canvas
   =========================================================
   Estructura general:
   1. Configuración inicial y referencias al DOM
   2. Clase Nave      -> dibujada con líneas (moveTo/lineTo)
   3. Clase Asteroide  -> dibujado con arcos (arc)
   4. Clase Disparo
   5. Clase Particula  -> efecto de explosión en espiral
   6. Clase PowerUp    -> dibujado con forma de estrella
   7. Game Loop (bucle de juego) con requestAnimationFrame
   ========================================================= */

// ---------- 1. Configuración inicial ----------

const canvas = document.getElementById("lienzo");
const ctx = canvas.getContext("2d");

const ANCHO = canvas.width;
const ALTO = canvas.height;

const pantallaInicio = document.getElementById("pantalla-inicio");
const pantallaFin = document.getElementById("pantalla-fin");
const botonIniciar = document.getElementById("boton-iniciar");
const botonReiniciar = document.getElementById("boton-reiniciar");
const puntajeFinalTexto = document.getElementById("puntaje-final");
const estadoTexto = document.getElementById("estado-texto");

let nave;
let asteroides = [];
let disparos = [];
let particulas = [];
let powerUps = [];

let puntaje = 0;
let vidas = 3;
let juegoActivo = false;
let cuadroAnimacion = null;
let contadorPowerUp = 0;

const teclas = {};

// Utilidad para números aleatorios en un rango
function aleatorioEntre(min, max) {
  return Math.random() * (max - min) + min;
}

// ---------- 2. Nave (figura de LÍNEAS) ----------

class Nave {
  constructor() {
    this.x = ANCHO / 2;
    this.y = ALTO / 2;
    this.radio = 14;
    this.angulo = -Math.PI / 2; // apunta hacia arriba
    this.velocidadX = 0;
    this.velocidadY = 0;
    this.enPropulsion = false;
    this.invulnerable = 0; // cuadros de invulnerabilidad tras un choque
    this.velocidadExtra = 0; // cuadros restantes de boost de velocidad
    this.escudo = 0; // cuadros restantes de escudo
  }

  rotar(direccion) {
    this.angulo += direccion * 0.06;
  }

  propulsar() {
    const factor = this.velocidadExtra > 0 ? 0.18 : 0.1;
    this.velocidadX += Math.cos(this.angulo) * factor;
    this.velocidadY += Math.sin(this.angulo) * factor;
    this.enPropulsion = true;
  }

  actualizar() {
    this.x += this.velocidadX;
    this.y += this.velocidadY;
    this.velocidadX *= 0.99;
    this.velocidadY *= 0.99;

    // La nave reaparece del otro lado de la pantalla (wrap-around)
    if (this.x < 0) this.x = ANCHO;
    if (this.x > ANCHO) this.x = 0;
    if (this.y < 0) this.y = ALTO;
    if (this.y > ALTO) this.y = 0;

    if (this.invulnerable > 0) this.invulnerable--;
    if (this.velocidadExtra > 0) this.velocidadExtra--;
    if (this.escudo > 0) this.escudo--;
  }

  dibujar() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angulo);

    // Parpadeo si está invulnerable tras un choque
    if (this.invulnerable > 0 && Math.floor(this.invulnerable / 4) % 2 === 0) {
      ctx.restore();
      this.enPropulsion = false;
      return;
    }

    // --- Cuerpo de la nave dibujado con moveTo / lineTo (LÍNEAS) ---
    ctx.beginPath();
    ctx.moveTo(this.radio, 0);
    ctx.lineTo(-this.radio * 0.8, this.radio * 0.7);
    ctx.lineTo(-this.radio * 0.4, 0);
    ctx.lineTo(-this.radio * 0.8, -this.radio * 0.7);
    ctx.closePath();
    ctx.strokeStyle = "#e9ecf2";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();

    // Escudo activo: círculo suave alrededor de la nave
    if (this.escudo > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, this.radio * 1.8, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(110, 231, 216, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // --- Llama del propulsor dibujada con un ARCO ---
    if (this.enPropulsion) {
      ctx.beginPath();
      ctx.arc(-this.radio * 0.5, 0, this.radio * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = "#f2665b";
      ctx.fill();
    }

    ctx.restore();
    this.enPropulsion = false;
  }
}

// ---------- 3. Asteroide (figura de ARCOS) ----------

class Asteroide {
  constructor(x, y, radio) {
    this.x = x;
    this.y = y;
    this.radio = radio;
    this.velocidadX = aleatorioEntre(-1.5, 1.5);
    this.velocidadY = aleatorioEntre(-1.5, 1.5);
    this.rotacion = 0;
    this.velocidadRotacion = aleatorioEntre(-0.02, 0.02);
  }

  actualizar() {
    this.x += this.velocidadX;
    this.y += this.velocidadY;
    this.rotacion += this.velocidadRotacion;

    if (this.x < -this.radio) this.x = ANCHO + this.radio;
    if (this.x > ANCHO + this.radio) this.x = -this.radio;
    if (this.y < -this.radio) this.y = ALTO + this.radio;
    if (this.y > ALTO + this.radio) this.y = -this.radio;
  }

  dibujar() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotacion);

    // --- Roca circular dibujada con arc() ---
    ctx.beginPath();
    ctx.arc(0, 0, this.radio, 0, Math.PI * 2);
    ctx.strokeStyle = "#8b93a5";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Un par de arcos internos para simular cráteres
    ctx.beginPath();
    ctx.arc(this.radio * 0.3, -this.radio * 0.2, this.radio * 0.18, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}

// ---------- 4. Disparo ----------

class Disparo {
  constructor(x, y, angulo) {
    this.x = x;
    this.y = y;
    this.velocidadX = Math.cos(angulo) * 6;
    this.velocidadY = Math.sin(angulo) * 6;
    this.vida = 60; // cuadros antes de desaparecer
  }

  actualizar() {
    this.x += this.velocidadX;
    this.y += this.velocidadY;
    this.vida--;
  }

  dibujar() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#6ee7d8";
    ctx.fill();
  }
}

// ---------- 5. Partícula de explosión (figura de ESPIRAL) ----------

class Particula {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angulo = 0;
    this.radioMax = aleatorioEntre(18, 30);
    this.vida = 40;
  }

  actualizar() {
    this.angulo += 0.5;
    this.vida--;
  }

  terminada() {
    return this.vida <= 0;
  }

  dibujar() {
    // --- Espiral: el radio crece junto con el ángulo (r = a * theta) ---
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.beginPath();

    const vueltas = 2.5;
    const pasos = 40;
    const progreso = 1 - this.vida / 40;

    for (let i = 0; i <= pasos * progreso; i++) {
      const t = (i / pasos) * vueltas * Math.PI * 2;
      const r = (this.radioMax * i) / pasos;
      const px = Math.cos(t) * r;
      const py = Math.sin(t) * r;
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.strokeStyle = `rgba(242, 102, 91, ${this.vida / 40})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}

// ---------- 6. Power-up (figura de ESTRELLA) ----------

class PowerUp {
  constructor() {
    this.x = aleatorioEntre(40, ANCHO - 40);
    this.y = -20;
    this.radio = 10;
    this.velocidadY = 1.2;
    this.tipo = Math.random() < 0.5 ? "velocidad" : "escudo";
  }

  actualizar() {
    this.y += this.velocidadY;
  }

  fueraDePantalla() {
    return this.y > ALTO + 20;
  }

  dibujar() {
    ctx.save();
    ctx.translate(this.x, this.y);

    // --- Estrella de 5 puntas dibujada con moveTo / lineTo ---
    ctx.beginPath();
    const puntas = 5;
    const radioExterno = this.radio;
    const radioInterno = this.radio * 0.45;

    for (let i = 0; i < puntas * 2; i++) {
      const r = i % 2 === 0 ? radioExterno : radioInterno;
      const angulo = (Math.PI / puntas) * i - Math.PI / 2;
      const px = Math.cos(angulo) * r;
      const py = Math.sin(angulo) * r;
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();

    ctx.fillStyle = this.tipo === "velocidad" ? "#6ee7d8" : "#f2c94c";
    ctx.fill();

    ctx.restore();
  }
}

// ---------- Colisiones ----------

function distancia(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

// ---------- Inicialización de una partida ----------

function iniciarJuego() {
  nave = new Nave();
  asteroides = [];
  disparos = [];
  particulas = [];
  powerUps = [];
  puntaje = 0;
  vidas = 3;
  contadorPowerUp = 0;

  for (let i = 0; i < 5; i++) {
    generarAsteroide();
  }

  juegoActivo = true;
  pantallaInicio.classList.add("oculto");
  pantallaFin.classList.add("oculto");
  estadoTexto.textContent = "Puntaje: 0 · Vidas: 3";

  if (cuadroAnimacion) cancelAnimationFrame(cuadroAnimacion);
  bucleDeJuego();
}

function generarAsteroide(x, y, radio) {
  const nuevoRadio = radio || aleatorioEntre(28, 42);
  let nx = x;
  let ny = y;

  if (nx === undefined) {
    // Aparece en un borde, lejos de la nave
    const borde = Math.floor(aleatorioEntre(0, 4));
    if (borde === 0) { nx = 0; ny = aleatorioEntre(0, ALTO); }
    else if (borde === 1) { nx = ANCHO; ny = aleatorioEntre(0, ALTO); }
    else if (borde === 2) { nx = aleatorioEntre(0, ANCHO); ny = 0; }
    else { nx = aleatorioEntre(0, ANCHO); ny = ALTO; }
  }

  asteroides.push(new Asteroide(nx, ny, nuevoRadio));
}

function destruirAsteroide(asteroide, indice) {
  // Efecto de explosión en espiral
  particulas.push(new Particula(asteroide.x, asteroide.y));
  puntaje += 10;

  // Si es grande, se divide en dos asteroides más chicos
  if (asteroide.radio > 18) {
    generarAsteroide(asteroide.x, asteroide.y, asteroide.radio * 0.55);
    generarAsteroide(asteroide.x, asteroide.y, asteroide.radio * 0.55);
  }

  asteroides.splice(indice, 1);
}

function perderVida() {
  if (nave.invulnerable > 0 || nave.escudo > 0) return;

  vidas--;
  particulas.push(new Particula(nave.x, nave.y));
  nave.x = ANCHO / 2;
  nave.y = ALTO / 2;
  nave.velocidadX = 0;
  nave.velocidadY = 0;
  nave.invulnerable = 90;

  if (vidas <= 0) {
    finalizarJuego();
  }
}

function finalizarJuego() {
  juegoActivo = false;
  cancelAnimationFrame(cuadroAnimacion);
  puntajeFinalTexto.textContent = "Puntaje: " + puntaje;
  pantallaFin.classList.remove("oculto");
}

// ---------- 7. Game Loop ----------

function actualizarEntradas() {
  if (teclas["ArrowLeft"]) nave.rotar(-1);
  if (teclas["ArrowRight"]) nave.rotar(1);
  if (teclas["ArrowUp"]) nave.propulsar();
}

function actualizar() {
  actualizarEntradas();
  nave.actualizar();

  asteroides.forEach((a) => a.actualizar());
  disparos.forEach((d) => d.actualizar());
  particulas.forEach((p) => p.actualizar());
  powerUps.forEach((p) => p.actualizar());

  disparos = disparos.filter((d) => d.vida > 0);
  particulas = particulas.filter((p) => !p.terminada());
  powerUps = powerUps.filter((p) => !p.fueraDePantalla());

  // Colisión disparo <-> asteroide
  for (let i = asteroides.length - 1; i >= 0; i--) {
    for (let j = disparos.length - 1; j >= 0; j--) {
      if (distancia(asteroides[i].x, asteroides[i].y, disparos[j].x, disparos[j].y) < asteroides[i].radio) {
        destruirAsteroide(asteroides[i], i);
        disparos.splice(j, 1);
        break;
      }
    }
  }

  // Colisión nave <-> asteroide
  for (const a of asteroides) {
    if (distancia(nave.x, nave.y, a.x, a.y) < a.radio + nave.radio * 0.6) {
      perderVida();
    }
  }

  // Colisión nave <-> power-up
  for (let i = powerUps.length - 1; i >= 0; i--) {
    if (distancia(nave.x, nave.y, powerUps[i].x, powerUps[i].y) < powerUps[i].radio + nave.radio) {
      if (powerUps[i].tipo === "velocidad") {
        nave.velocidadExtra = 240;
      } else {
        nave.escudo = 240;
      }
      powerUps.splice(i, 1);
    }
  }

  // Generación periódica de asteroides y power-ups
  if (asteroides.length < 6 && Math.random() < 0.01) {
    generarAsteroide();
  }

  contadorPowerUp++;
  if (contadorPowerUp > 400) {
    powerUps.push(new PowerUp());
    contadorPowerUp = 0;
  }

  estadoTexto.textContent = "Puntaje: " + puntaje + " · Vidas: " + Math.max(vidas, 0);
}

function dibujar() {
  ctx.clearRect(0, 0, ANCHO, ALTO);

  nave.dibujar();
  asteroides.forEach((a) => a.dibujar());
  disparos.forEach((d) => d.dibujar());
  particulas.forEach((p) => p.dibujar());
  powerUps.forEach((p) => p.dibujar());

  // HUD simple dentro del canvas
  ctx.fillStyle = "#e9ecf2";
  ctx.font = "14px 'JetBrains Mono', monospace";
  ctx.fillText("Puntaje: " + puntaje, 16, 24);
  ctx.fillText("Vidas: " + Math.max(vidas, 0), 16, 44);
}

function bucleDeJuego() {
  if (!juegoActivo) return;
  actualizar();
  dibujar();
  cuadroAnimacion = requestAnimationFrame(bucleDeJuego);
}

// ---------- Eventos ----------

window.addEventListener("keydown", (evento) => {
  teclas[evento.key] = true;

  if (evento.key === " " && juegoActivo) {
    evento.preventDefault();
    disparos.push(new Disparo(nave.x, nave.y, nave.angulo));
  }
});

window.addEventListener("keyup", (evento) => {
  teclas[evento.key] = false;
});

botonIniciar.addEventListener("click", iniciarJuego);
botonReiniciar.addEventListener("click", iniciarJuego);
