const container = document.querySelector(".scratch-container");
let canvas = document.getElementById("scratch-card-canvas");
let canvasContext = canvas.getContext("2d"); //how we access and draw on the canvas; gets the 2D rendering context for the <canvas> element

let containerWidth, containerHeight;
let savedImage = null; // need to store previous state of the canvas

// Update container size dynamically
const updateContainerSize = () => {
  containerWidth = container.getBoundingClientRect().width;
  containerHeight = container.getBoundingClientRect().height;
  canvas.width = containerWidth;
  canvas.height = containerHeight;
};

// restore canvas state after resizing or initialization so that the scratched-off areas aren't lost
// globalCompositeOperation is a canvas property that controls how new drawings interact with existing pixels on the canvas
// we can change how the new pixels blend with the old ones, including erasing pixels
const restoreCanvasState = () => {
  canvasContext.globalCompositeOperation = "source-over"; //source-over is its default mode: new shapes are drawn on top of existing ones
  if (savedImage) {
    let img = new Image();
    img.onload = () => {
      requestAnimationFrame(() => {
        canvasContext.drawImage(img, 0, 0, canvas.width, canvas.height);
      });
    };
    img.src = savedImage;
  } else {
    canvasContext.fillStyle = "#050607"; // to blend in with the background
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
  }
};

// need to initialize canvas
const init = () => {
  updateContainerSize();
  restoreCanvasState();
};

init();

// handle resizing
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    savedImage = canvas.toDataURL(); // saving current scratch state
    init(); // reinitializes the canvas with the new size
  }, 300);
});


// scratch effect
let isDragging = false;

const scratch = (x, y) => {
  canvasContext.globalCompositeOperation = "destination-out"; //this mode erases existing pixels
  canvasContext.beginPath();
  canvasContext.arc(x, y, 24, 0, 2 * Math.PI);
  canvasContext.fill();
};

canvas.addEventListener("mousedown", (event) => {
  isDragging = true;
  scratch(event.offsetX, event.offsetY);
});

canvas.addEventListener("mousemove", (event) => {
  if (isDragging) { //isDragging can be either true or false depending on the previous user interaction
    scratch(event.offsetX, event.offsetY);
  }
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
});

canvas.addEventListener("mouseleave", () => {
  isDragging = false;
});

// ensuring the ticket is keyboard-navigable
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    document.querySelector(".flip-card").classList.toggle("flipped");
  }
});



// Flip the card at random intervals
function randomFlip() {
  const flipCard = document.querySelector(".flip-card");
  const randomTime = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000; // random interval between 5s and 10s
  
  setTimeout(() => {
    flipCard.classList.add("flipped");
    setTimeout(() => {
      flipCard.classList.remove("flipped");
      randomFlip(); // restart the loop for continuous random flipping
    }, 10000); // flip back after 10 seconds
  }, randomTime);
}

randomFlip();


//download ticket front and back
document.getElementById("download-btn").addEventListener("click", () => {
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");

    // setting the canvas size to fit both images (stacked vertically)
    let imgFront = new Image();
    let imgBack = new Image();
    imgFront.src = "img/ticket-front.png";
    imgBack.src = "img/ticket-back.png";

    imgFront.onload = () => {
        imgBack.onload = () => {
            canvas.width = imgFront.width;  // use the width of one image
            canvas.height = imgFront.height * 2; // double the height to fit both

            // draw the front ticket on the top
            context.drawImage(imgFront, 0, 0);

            // draw the back ticket below the front ticket
            context.drawImage(imgBack, 0, imgFront.height);

            // convert the canvas to an image and trigger download
            let link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = "busojaras_ticket.png";
            link.click();
        };
    };
});

//reveal ticket option
document.getElementById("reveal-btn").addEventListener("click", () => {
  document.getElementById("scratch-card-canvas").style.display = "none"; 
});



