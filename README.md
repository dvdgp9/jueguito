# Army Clash - Crowd Runner 🎮

Un juego tipo "Crowd Runner" inspirado en esos anuncios de móvil. ¡Pero este SÍ funciona de verdad!

## Cómo jugar

1. **Arrastra** izquierda/derecha para mover tu ejército
2. **Pasa por puertas verdes** (+, ×) para multiplicar soldados
3. **Evita las rojas** (-, ÷) que reducen tu ejército
4. **Derrota al enemigo** al final del nivel

## Ejecutar localmente

Simplemente abre `index.html` en tu navegador. No requiere servidor.

O si prefieres con servidor local:
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve
```

## Deploy en cPanel

1. Entra a **cPanel → File Manager**
2. Ve a `public_html` (o crea subcarpeta `public_html/juego`)
3. Sube todos los archivos:
   - `index.html`
   - `css/style.css`
   - `js/game.js`
4. Accede desde tu dominio

## Estructura

```
jueguito/
├── index.html      # Página principal
├── css/
│   └── style.css   # Estilos del juego
├── js/
│   └── game.js     # Toda la lógica del juego
└── README.md
```

## Tecnologías

- HTML5 Canvas
- JavaScript puro (sin dependencias)
- CSS3

## Licencia

Haz lo que quieras con esto 🎉
