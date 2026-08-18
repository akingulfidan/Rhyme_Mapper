
export function resizeCanvas(ctx, resFactor) {

  let canvas = ctx.canvas;

  canvas.drawingWidth = window.innerWidth*0.7;
  canvas.drawingHeight = window.innerHeight;

  canvas.width = canvas.drawingWidth*resFactor;
  canvas.height = canvas.drawingHeight*resFactor;

  canvas.style.width = `${canvas.drawingWidth}px`; 
  canvas.style.height = `${canvas.drawingHeight}px`;

  ctx.scale(resFactor, resFactor);

}

export function setupCanvas(resFactor, context){

  let canvas = document.createElement("canvas");
  document.body.prepend(canvas);
  let ctx = canvas.getContext(context);

  resizeCanvas(ctx, resFactor);

  return ctx
  
}

function drawPhoneme(ctx, x,y,stress) {

  ctx.beginPath();
  ctx.arc(x,y,stress,0,2*Math.PI);
  ctx.stroke();
  ctx.closePath();

}

export function renderGraph(ctx){
  let canvas = ctx.canvas
  drawPhoneme(ctx, canvas.drawingWidth/2,canvas.drawingHeight/2,50);
}