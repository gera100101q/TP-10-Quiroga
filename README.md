# Asteroides — Videojuego Arcade con HTML5 Canvas

Proyecto de la materia Laboratorio de Programación - 6° G (IPET N° 249). Videojuego 2D tipo Asteroides desarrollado íntegramente con HTML5 Canvas y JavaScript puro, sin imágenes externas.

## Trabajo Práctico N° 10 - Desarrollo de Videojuego Arcade con HTML5 Canvas e IA

Opción elegida: **B. Asteroides (Nave Espacial)**.

El juego consiste en pilotear una nave vectorial, destruir asteroides a los disparos, esquivar los choques y recolectar power-ups en forma de estrella (velocidad o escudo) antes de quedarse sin vidas.

## Figuras complejas aplicadas

- **Líneas (moveTo / lineTo):** cuerpo vectorial de la nave, dibujado y rotado con trigonometría.
- **Arcos (arc):** los asteroides (rocas circulares) y la llama del propulsor de la nave.
- **Espiral:** efecto de partículas al destruir un asteroide o al chocar la nave (radio creciente en función del ángulo).
- **Estrella:** power-ups de velocidad y de escudo que caen desde arriba de la pantalla.

## Estructura del proyecto

```
├── index.html                     Estructura de la página y el canvas
├── style.css                      Estilos de la interfaz (fuera del canvas)
├── script.js                      Lógica del juego: clases, colisiones y game loop
└── ficha-transparencia-IA.md      Ficha de transparencia de uso de IA (a completar)
```

## Controles

- Flechas izquierda / derecha: rotar la nave
- Flecha arriba: propulsión
- Barra espaciadora: disparar

## Requisitos técnicos cumplidos

- Sistema de coordenadas y contexto 2D de Canvas
- Trazado de rutas (paths) para renderizar todos los elementos del juego
- Game Loop con requestAnimationFrame que actualiza la lógica y redibuja la pantalla en cada cuadro
- Detección de colisiones entre nave, asteroides, disparos y power-ups
- Al menos 3 figuras complejas vistas en clase (se aplicaron 4: líneas, arcos, espiral y estrella)
- No se utilizan imágenes externas: todos los elementos visuales se generan por código

## Sobre el uso de Inteligencia Artificial

Este trabajo se desarrolló siguiendo las Reglas de Oro y de Ética IA del TP10: la IA se usó como asistente para explicar conceptos y generar una base de código, que fue revisada, probada y ajustada antes de integrarla. El detalle de cada consulta importante realizada está documentado en `ficha-transparencia-IA.md`, completado con los prompts reales utilizados durante el desarrollo.

## Tecnologías utilizadas

- HTML5 (Canvas API)
- CSS3
- JavaScript (vanilla, sin librerías ni frameworks)
- Google Fonts (JetBrains Mono y Work Sans)

## Cómo verlo

Opción 1 - Online: activar GitHub Pages en el repositorio (Settings > Pages > Branch: main) y acceder a:
```
https://gera100101q.github.io/TP-10-QUIROGA
```

Opción 2 - Local: descargar el proyecto completo y abrir index.html con el navegador, manteniendo style.css y script.js en la misma carpeta.

## Datos de la entrega

- Trabajo Práctico: N° 10 - Desarrollo de Videojuego Arcade con HTML5 Canvas e IA
- Materia: Laboratorio de Programación
- Curso: 6° G - IPET N° 249
- Modalidad: Individual

## Autor

Gerardo Quiroga
