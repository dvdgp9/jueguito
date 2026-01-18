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

## High-level Task Breakdown

### Fase 1: Setup básico
- [ ] **Task 1.1**: Crear estructura HTML + Canvas responsive
  - *Criterio de éxito*: Canvas visible a pantalla completa, responsive
- [ ] **Task 1.2**: Implementar game loop básico (60 FPS)
  - *Criterio de éxito*: Loop corriendo, se puede dibujar un rectángulo que se mueve

### Fase 2: Mecánicas core
- [ ] **Task 2.1**: Crear sistema de "pista" con perspectiva (el camino)
  - *Criterio de éxito*: Se ve un camino que simula profundidad
- [ ] **Task 2.2**: Implementar ejército del jugador (grupo de soldados)
  - *Criterio de éxito*: Grupo de círculos/sprites que se mueven juntos, controlables con touch/mouse
- [ ] **Task 2.3**: Sistema de puertas con operaciones matemáticas
  - *Criterio de éxito*: Puertas visibles, detectan colisión, aplican operación (+, -, x, ÷)
- [ ] **Task 2.4**: Contador visual de soldados
  - *Criterio de éxito*: Número grande visible que se actualiza en tiempo real

### Fase 3: Batalla y progresión
- [ ] **Task 3.1**: Enemigos al final del nivel
  - *Criterio de éxito*: Grupo enemigo visible con su contador
- [ ] **Task 3.2**: Sistema de batalla (colisión = resta mutua)
  - *Criterio de éxito*: Al chocar, ambos ejércitos pierden soldados, gana quien tenga más
- [ ] **Task 3.3**: Pantalla de victoria/derrota
  - *Criterio de éxito*: Mensaje claro de resultado, botón para reiniciar

### Fase 4: Polish y deploy
- [ ] **Task 4.1**: Efectos visuales (partículas, animaciones)
  - *Criterio de éxito*: Feedback visual al pasar puertas y en batalla
- [ ] **Task 4.2**: Sonidos básicos (opcional)
  - *Criterio de éxito*: Sonido al multiplicar, al batallar
- [ ] **Task 4.3**: Deploy a cPanel
  - *Criterio de éxito*: Juego accesible desde el dominio del usuario

## Project Status Board

### To Do
- [ ] Task 1.1: Estructura HTML + Canvas
- [ ] Task 1.2: Game loop
- [ ] Task 2.1: Sistema de pista
- [ ] Task 2.2: Ejército del jugador
- [ ] Task 2.3: Sistema de puertas
- [ ] Task 2.4: Contador visual
- [ ] Task 3.1: Enemigos
- [ ] Task 3.2: Sistema de batalla
- [ ] Task 3.3: Victoria/derrota
- [ ] Task 4.1: Efectos visuales
- [ ] Task 4.2: Sonidos
- [ ] Task 4.3: Deploy a cPanel

### In Progress
- [ ] Task 4.2: Sonidos (opcional)
- [ ] Task 4.3: Deploy a cPanel

### Done
- [x] Task 1.1: Estructura HTML + Canvas
- [x] Task 1.2: Game loop
- [x] Task 2.1: Sistema de pista con perspectiva
- [x] Task 2.2: Ejército del jugador
- [x] Task 2.3: Sistema de puertas
- [x] Task 2.4: Contador visual
- [x] Task 3.1: Enemigos
- [x] Task 3.2: Sistema de batalla
- [x] Task 3.3: Victoria/derrota
- [x] Task 4.1: Efectos visuales (partículas)

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
