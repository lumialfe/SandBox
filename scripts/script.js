const c = document.getElementById("canvas");
var context = canvas.getContext("2d");

const w = 10;
const rows = c.height / w;
const cols = c.width / w;

let running = true;

const colors = [
	(red_pastel_gradient = ["#FF9AA2", "#FFB7B2"]),
	(orange_pastel_gradient = ["#FFB07C", "#FFCB9A"]),
	(yellow_pastel_gradient = ["#FFD166", "#FFE39F"]),
	(green_pastel_gradient = ["#D8E9D5", "#E9EDC9"]),
	(blue_pastel_gradient = ["#A0D2DB", "#B8E1DC"]),
	(purple_pastel_gradient = ["#B197FC", "#D3A0F3"]),
	(pink_pastel_gradient = ["#D3A0F3", "#E3B7F8"])
];

// Current color
let cc = {
	x: 0,
	y: 0
};

function nextColor() {
	if (cc.y < colors[cc.x].length - 1) {
		cc.y++;
		return;
	} else if (cc.x < colors.length - 1) {
		cc.x++;
		cc.y = 0;
		return;
	}
	cc.x = 0;
	cc.y = 0;
}

function drawGrid() {
	for (let x = 0; x < c.width; x += w) {
		context.moveTo(x, 0);
		context.lineTo(x, c.height);
	}
	for (let y = 0; y < c.height; y += w) {
		context.moveTo(0, y);
		context.lineTo(c.height, y);
	}
	context.strokeStyle = "white";
	context.stroke();
}

function drawSquare(x, y, color = "white") {
	context.fillStyle = color;
	context.fillRect(x * w, y * w, w, w);
}

function gravity() {
	for (let i = 0; i < cols; i++) {
		for (let j = rows - 1; j >= 0; j--) {
			const currentSquare = context.getImageData(i * w, j * w, w, w);
			const belowSquare = context.getImageData(i * w, (j + 1) * w, w, w);
			const leftSquare = context.getImageData((i - 1) * w, (j + 1) * w, w, w);
			const rightSquare = context.getImageData((i + 1) * w, (j + 1) * w, w, w);

			if (currentSquare.data[3] > 0) {
				if (j < rows - 1 && belowSquare.data[3] == 0) {
					const color = currentSquare.data;
					context.clearRect(i * w, j * w, w, w);
					drawSquare(
						i,
						j + 1,
						`rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`
					);
				} else if (j < rows - 1 && belowSquare.data[3] > 0) {
					if (i > 0 && leftSquare.data[3] == 0) {
						const color = currentSquare.data;
						context.clearRect(i * w, j * w, w, w);
						drawSquare(
							i - 1,
							j + 1,
							`rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`
						);
					} else if (i < cols - 1 && rightSquare.data[3] == 0) {
						const color = currentSquare.data;
						context.clearRect(i * w, j * w, w, w);
						drawSquare(
							i + 1,
							j + 1,
							`rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`
						);
					}
				}
			}
		}
	}
}

function freeze() {
	running = !running;
	if (running) {
		document.getElementById("freeze").innerText = "Freeze";
	} else {
		document.getElementById("freeze").innerText = "Unfreeze";
	}
}

c.addEventListener("mousemove", addSandOnMouseMove);

var mouseDown = false;
document.body.onmousedown = (event) => {
	mouseDown = true;
	const x = Math.floor(event.offsetX / w);
	const y = Math.floor(event.offsetY / w);

	const canvasOffset = c.getBoundingClientRect();
	const offsetX = event.clientX - canvasOffset.left;
	const offsetY = event.clientY - canvasOffset.top;

	if (offsetX >= 0 && offsetX < c.width && offsetY >= 0 && offsetY < c.height) {
		addSandOnMouseMove(event);
	}
};
document.body.onmouseup = () => {
	mouseDown = false;
};

function addSandOnMouseMove(event) {
	if (mouseDown) {
		const x = Math.floor(event.offsetX / w);
		const y = Math.floor(event.offsetY / w);

		const color = colors[cc.x][cc.y];
		const brushSize = document.getElementById("brush-size").value;

		for (let i = x - brushSize; i <= x + 1; i++) {
			for (let j = y - brushSize; j <= y + 1; j++) {
				if (i >= 0 && i < cols && j >= 0 && j < rows) {
					if (Math.random() > 0.5) {
						// If the square is empty
						if (context.getImageData(i * w, j * w, w, w).data[3] == 0) {
							drawSquare(i, j, color);
						} else {
							context.clearRect(i * w, j * w, w, w);
						}
					}
				}
			}
		}
		if (Math.random() > 0.85) {
			nextColor();
		}
	}
}

function clearCanvas() {
	context.clearRect(0, 0, c.width, c.height);
}

function randomizeCanvas() {
	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			if (
				Math.random() > 0.65 &&
				context.getImageData(i * w, j * w, w, w).data[3] == 0
			) {
				drawSquare(i, j, colors[cc.x][cc.y]);
			}
			if (Math.random() > 0.95) {
				nextColor();
			}
		}
	}
}

function saveAsImage() {
	const link = document.createElement("a");
	link.download = "sand-art.png";
	link.href = c.toDataURL("image/png");
	link.click();
}

function rotate() {
	freeze();
	const imageData = context.getImageData(0, 0, c.width, c.height);
	const rotatedImageData = context.createImageData(c.height, c.width);
	// Rotate image data globally by 180 degrees
	for (let i = 0; i < imageData.data.length; i += 4) {
		const x = Math.floor((i / 4) % c.width);
		const y = Math.floor(i / 4 / c.width);
		const newX = c.height - y - 1;
		const newY = x;
		const newIndex = (newY * c.height + newX) * 4;
		rotatedImageData.data[newIndex] = imageData.data[i];
		rotatedImageData.data[newIndex + 1] = imageData.data[i + 1];
		rotatedImageData.data[newIndex + 2] = imageData.data[i + 2];
		rotatedImageData.data[newIndex + 3] = imageData.data[i + 3];
	}
	context.clearRect(0, 0, c.width, c.height);
	c.width = rotatedImageData.width;
	c.height = rotatedImageData.height;
	context.putImageData(rotatedImageData, 0, 0);

	freeze();
}

setInterval(() => {
	if (running) {
		gravity();
	}
}, 10);
