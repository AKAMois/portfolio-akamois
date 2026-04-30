class MotionBlur {
  constructor() {
    this.root = document.body; // Referencia al body para calcular posición
    this.cursor = document.querySelector(".curzr-motion"); // Selecciona el SVG del cursor
    this.filter = document.querySelector(".curzr-motion-blur"); // Selecciona el feGaussianBlur

    // Guarda la posición actual y anterior del ratón para calcular distancia
    this.position = { distanceX: 0, distanceY: 0, pointerX: 0, pointerY: 0 };
    this.previousPointerX = 0;
    this.previousPointerY = 0;

    this.angle = 0; // Ángulo actual de rotación
    this.previousAngle = 0; // Ángulo anterior para calcular cambios
    this.degrees = 57.296; // Factor de conversión de radianes a grados
    this.moving = false; // Controla si el ratón está en movimiento

    // Aplica estilos al SVG directamente desde JS
    Object.assign(this.cursor.style, {
      position: "fixed",
      top: "-7px", // Compensa la mitad del alto para centrar el cursor
      left: "-7px", // Compensa la mitad del ancho
      zIndex: "9999",
      width: "15px",
      height: "15px",
      overflow: "visible",
      transition: "200ms, transform 20ms",
      pointerEvents: "none", // No intercepta clicks ni hover
    });

    setTimeout(() => this.cursor.removeAttribute("hidden"), 500); // Muestra el cursor tras 500ms
    this.cursor.style.opacity = 1;
  }

  move(event) {
    // Guarda la posición anterior antes de actualizarla
    this.previousPointerX = this.position.pointerX;
    this.previousPointerY = this.position.pointerY;

    // Lee la posición actual del ratón
    this.position.pointerX = event.pageX + this.root.getBoundingClientRect().x;
    this.position.pointerY = event.pageY + this.root.getBoundingClientRect().y;

    // Calcula cuánto se ha movido, limitado entre -20 y 20
    this.position.distanceX = Math.min(
      Math.max(this.previousPointerX - this.position.pointerX, -20),
      20,
    );
    this.position.distanceY = Math.min(
      Math.max(this.previousPointerY - this.position.pointerY, -20),
      20,
    );

    // Mueve el SVG a la posición del ratón
    this.cursor.style.transform = `translate3d(${this.position.pointerX}px, ${this.position.pointerY}px, 0)`;

    this.rotate(this.position); // Calcula y aplica la rotación y el blur
    this.moving ? this.stop() : (this.moving = true); // Si se mueve, programa la parada
  }

  rotate(position) {
    // Calcula el ángulo del movimiento en grados
    let unsortedAngle =
      Math.atan(Math.abs(position.distanceY) / Math.abs(position.distanceX)) *
      this.degrees;

    if (isNaN(unsortedAngle)) {
      this.angle = this.previousAngle; // Sin movimiento, mantiene el ángulo anterior
    } else {
      if (unsortedAngle <= 45) {
        // Movimiento más horizontal: blur en eje X
        this.angle =
          position.distanceX * position.distanceY >= 0
            ? +unsortedAngle
            : -unsortedAngle;
        this.filter.setAttribute(
          "stdDeviation",
          `${Math.abs(this.position.distanceX / 2)}, 0`,
        );
      } else {
        // Movimiento más vertical: blur en eje Y
        this.angle =
          position.distanceX * position.distanceY <= 0
            ? 180 - unsortedAngle
            : unsortedAngle;
        this.filter.setAttribute(
          "stdDeviation",
          `${Math.abs(this.position.distanceY / 2)}, 0`,
        );
      }
    }
    this.cursor.style.transform += ` rotate(${this.angle}deg)`; // Aplica la rotación
    this.previousAngle = this.angle; // Guarda para la próxima iteración
  }

  stop() {
    setTimeout(() => {
      this.filter.setAttribute("stdDeviation", "0, 0"); // Elimina el blur al parar
      this.moving = false; // Marca que ya no se mueve
    }, 50); // 50ms para que la transición sea suave
  }
}

// Inicialización
const cursor = new MotionBlur();
document.onmousemove = (event) => cursor.move(event); // Llama a move() con cada movimiento
