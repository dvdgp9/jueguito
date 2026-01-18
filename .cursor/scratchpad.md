# Proyecto: Juego "Crowd Runner" / "Army Clash"

## Background and Motivation

El usuario quiere crear un juego similar a los anuncios falsos de móviles - específicamente un "Crowd Runner" donde:
- Controlas un ejército de soldados que corre automáticamente por un camino
- Hay puertas con operaciones matemáticas (+10, x2, -5, ÷2, etc.) que modifican el número de soldados
- Al final del nivel hay una batalla contra enemigos
- El objetivo es llegar con el mayor número posible de soldados

**Requisitos del usuario:**
- Fácil de desplegar/ejecutar (primera vez haciendo un juego)
- Partir desde cero
- Que funcione de verdad como los anuncios prometen
Síiii
## Key Challenges and Analysis

### Decisión de tecnología

| Opción | Pros | Contras |
|--------|------|---------|
| **HTML5 Canvas + JS puro** | Sin dependencias, muy ligero, fácil deploy | Más código manual para física/colisiones |
| **Phaser.js** | Framework de juegos 2D maduro, muchas features | Curva de aprendizaje, más pesado |
| **Three.js (3D)** | Visual más cercano al anuncio | Mucho más complejo, no apto para principiantes |

**Decisión: HTML5 Canvas + JavaScript puro con vista "pseudo-3D" (perspectiva isométrica simple)**

Razones:
1. Cero dependencias = deploy trivial (solo archivos estáticos)
2. Funciona en cualquier navegador
3. Se puede desplegar en Netlify con un click
4. El código es entendible para aprender

### Mecánicas core del juego

1. **Movimiento automático**: El ejército avanza solo, el jugador solo controla izquierda/derecha
2. **Puertas multiplicadoras**: Colisión detecta qué puerta tocas, aplica la operación
3. **Visualización del ejército**: Grupo de círculos/sprites que representan soldados
4. **Batalla final**: Los soldados chocan con enemigos, gana quien tenga más
5. **Sistema de niveles**: Progresión simple

### Arquitectura propuesta

```
jueguito/
├── index.html          # Punto de entrada
├── css/
│   └── style.css       # Estilos del juego
├── js/
│   ├── game.js         # Loop principal y estado del juego
│   ├── player.js       # Lógica del ejército del jugador
│   ├── gates.js        # Sistema de puertas/multiplicadores
│   ├── enemies.js      # Enemigos finales
│   └── renderer.js     # Dibujado en canvas
├── assets/
│   └── (sprites opcionales)
└── README.md           # Instrucciones de uso
```

## High-level Task Breakdown (V2: Mejoras Pro)

### Fase 5: Refactor de Perspectiva y Cámara
- [ ] **Task 5.1**: Invertir renderizado (objetos vienen del horizonte arriba)
  - *Criterio de éxito*: Las puertas aparecen pequeñas en el horizonte y crecen al acercarse
- [ ] **Task 5.2**: Efecto de inclinación de cámara (Tilt) al mover el ejército
  - *Criterio de éxito*: La pista se inclina ligeramente según el movimiento lateral

### Fase 6: Variedad de Obstáculos y Enemigos
- [ ] **Task 6.1**: Obstáculos físicos (muros, sierras)
  - *Criterio de éxito*: Obstáculos que restan soldados directamente si los tocas
- [ ] **Task 6.2**: Enemigos intermedios
  - *Criterio de éxito*: Pequeños grupos enemigos durante el trayecto, no solo al final

### Fase 7: Polish Visual
- [ ] **Task 7.1**: Animación de "bobbing" (salto) para los soldados al correr
  - *Criterio de éxito*: Los soldados parecen estar corriendo/saltando
- [ ] **Task 7.2**: Fondo dinámico (nubes o mar en movimiento)
  - *Criterio de éxito*: El fondo tiene movimiento para aumentar la sensación de velocidad

## Project Status Board

### To Do
- [ ] Task 5.1: Invertir renderizado
- [ ] Task 5.2: Efecto Tilt cámara
- [ ] Task 6.1: Obstáculos físicos
- [ ] Task 6.2: Enemigos intermedios
- [ ] Task 7.1: Animación soldados
- [ ] Task 7.2: Fondo dinámico

### In Progress
(ninguno)

### Done
- [x] Task 1.1 a 4.1: Versión base funcional
- [x] Git Init & Push inicial


## Executor's Feedback or Assistance Requests

**Estado: Juego funcional completo** ✅

El juego está listo para probar. Falta:
1. Sonidos (opcional, se puede omitir)
2. Deploy a cPanel (el usuario debe subir los archivos)

**Archivos creados:**
- `index.html`
- `css/style.css`
- `js/game.js`
- `README.md`

## Lessons

(Se irán añadiendo durante el desarrollo)

---

## Notas técnicas adicionales

### Controles
- **Desktop**: Mover ratón izquierda/derecha
- **Mobile**: Touch y arrastrar izquierda/derecha

### Fórmulas de las puertas
- Verde: Operaciones positivas (+N, xN)
- Rojo: Operaciones negativas (-N, ÷N)

### Deploy (cPanel)
1. Subir archivos a `public_html` o subcarpeta
2. No requiere configuración adicional
3. MySQL disponible si en el futuro queremos rankings/usuarios
