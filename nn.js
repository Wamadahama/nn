let forwardMultiplyGate = function(x,y) {
    return x*y;
}

let x = -2, y = 3;

let out = forwardMultiplyGate(x, y)

let h = 0.0001;


let xph = x+h
let out2 = forwardMultiplyGate(xph, y)
let x_derivative = (out2 - out)/h;

let yph = y + h
let out3 = forwardMultiplyGate(x, yph)
let y_derivative = (out3 - out) / h

let step_size = 0.01

out = forwardMultiplyGate(x,y)

x = x + step_size * x_derivative
y = y + step_size * y_derivative

let out_new = forwardMultiplyGate(x,y)


// Analytic gradient
x = -2, y = 3

out = forwardMultiplyGate(x,y)

let x_gradient = y 
let y_gradient = x

let step_size = 0.01

x += step_size * x_gradient
y += step_size * y_gradient

out_new = forwardMultiplyGate(x,y)


// Every unit corresponds to a wire in the diagrams
let Unit = function(value, grad) {
    // value computed in the forward pass
    this.value = value;

    // the derivative of circuit output w.r.t this unit, computer in backward pass
    this.grad = grad; 
}

let multiplyGate = function(){};
multiplyGate.prototype = {
    forward: function(unit1, unit2) {
	this.unit1 = unit1;
	this.unit2 = unit2;
	this.utop = new Unit(unit1.value * unit2.value, 0.0);
	return this.utop
    },
    backward: function() {
	this.unit1.grad += this.unit2.value * this.utop.grad;
	this.unit2.grad += this.unit1.value * this.utop.grad; 
    }
    
}

let addGate = function(){};
addGate.prototype = {
    forward: function(unit1, unit2) {
	this.unit1 = unit1
	this.unit2 = unit2
	this.utop = new Unit(unit1.value + unit2.value, 0.0)
	return this.utop; 
    },
    backward: function() {
	this.unit1.grad += 1 * this.utop.grad;
	this.unit2.grad += 1 * this.utop.grad; 
    }
}


let sigmoidGate = function() {
    this.sig = function(x) { return 1 / (1 + Math.exp(-x)); }
};
sigmoidGate.prototype = {
    forward: function(unit1) {
	this.unit1 = unit1;
	this.utop = new Unit(this.sig(this.unit1.value),0.0);
	return this.utop; 
    },
    backward: function() {
	let s = this.sig(this.unit1.value);
	this.unit1.grad += (s * (1 - s)) * this.utop.grad 
    }
}

let squareGate = function() {
};
squareGate.prototype = {
    forward: function(unit1) {
	this.unit1 = unit1;
	this.utop = new Unit(unit1.value*unit1.value, 0.0)
	return this.utop;
    },
    backward: function() {
	let dx = 2 * this.unit1.value;
	this.unit1.grad += dx * this.utop.grad 
    }
};


let x = new Unit(3, 0.0)
let y = new Unit(1, 0.0)
let z = new Unit(-3,0.0)

let sqG0  = new squareGate();
let mulg0 = new multiplyGate();
let addg0 = new addGate();
let sg0   = new sigmoidGate();

let xsq
let yz
let xsqpyz
let s 

function forwardNeuron() {
    xsq = sqG0.forward(x)
    yz  = mulg0.forward(y,z)
    xsqpyz = addg0.forward(xsq, yz)
    s = sg0.forward(xsqpyz)
};

forwardNeuron();

console.log(s.value)


s.grad = 1.0;
sg0.backward();
addg0.backward();
mulg0.backward();
sqG0.backward();

let step_size = 0.01;

x.value += step_size * x.grad;
y.value += step_size * y.grad;
z.value += step_size * z.grad; 


forwardNeuron();

console.log('circuit output after one backprop:' + s.value)





 
