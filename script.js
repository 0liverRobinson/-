class Pixel
{
    constructor(x,y,col)
    {
        this.x =x ;
        this.y= y;
        this.col = col;
    }
}
const canvas = document.getElementsByTagName('canvas')[0], background = document.getElementsByTagName('canvas')[1];
const centralEditor = document.getElementById("centralEditor");
const brushStyle = document.getElementById("brushStyle");
const RIGHTCLICK = 2, LEFTCLICK = 0;
const CANVASBORDER = 10;
const BITSELECTION = document.getElementById("bitSelection");
const BITCOUNT = document.getElementById("bitCount"), BITCOUNT_TXT = "ビット: ";
const TRANSPARENT_GREY = "rgb(218, 220, 224)", TRANSPARENT_WHITE = "rgb(255, 255, 255)";
const DOWNLOAD_BUTTON = document.createElement("a");

let ctx = canvas.getContext("2d"), bg = background.getContext("2d");
let bits = BITSELECTION.value;
let brushX, brushY;
let isPainting = false, isErasing = false;
let selectedColor=brushStyle.value;

let currentLayer = 0;
let currentColor = brushStyle.value;
let picture = [[]];
let match = false;



function adjustScreen()
{

    // Round to nearest power of two
    bits = BITSELECTION.value = Math.pow(2, Math.round(Math.log2(BITSELECTION.value)));

    BITCOUNT.innerHTML = BITCOUNT_TXT + bits;

    // Position elements \\
    document.body.style.width = window.innerWidth + "px";
    document.body.style.height = window.innerHeight + "px";
    
    background.height = background.width = canvas.height = canvas.width = Math.round(Math.round( ( window.innerHeight/ 2 ) / bits) * bits);
    canvas.style.border= background.style.border = CANVASBORDER + "px solid white";
    background.style.left = "0px";
    background.style.top =  "0px";



    // Draw transparent background squares \\

    // Clear previous background
    bg.clearRect(0,0, background.width, background.height);

    // Draw backgroud
    for (var x = 0; x <= bits; x++)
        for (var y = 0; y <= bits; y++)
        {
            bg.fillStyle = (x % 2 == 0 && y % 2 != 0 || x % 2 != 0 && y % 2 == 0 ) ? TRANSPARENT_GREY : TRANSPARENT_WHITE;
            bg.fillRect(x * background.width/bits, y * background.height/bits, background.width/bits, background.height/bits);       
        }

    console.log(background.height);
}


function updateBrushPos(event)
{
    // Update brush position relative to the canvas (indexing at 0)
    brushX = Math.floor ( ( event.clientX - centralEditor.offsetLeft + (canvas.width + background.width/bits/2 )/2 - CANVASBORDER) / (canvas.width/bits) + bits / 64);
    brushY = Math.floor ( ( event.clientY - ( (centralEditor.offsetTop - centralEditor.offsetHeight/2) ) - CANVASBORDER ) / ( canvas.height/bits ) );
}


function drawPixels(event)
{
    if (event.button == RIGHTCLICK)
        isErasing = !(isPainting = false);
    else
        isPainting = true;
   event.preventDefault();
}
function stopDraw(event)
{
    event.preventDefault();
    return (isPainting = isErasing = false);
}

function save()
{
    let fileSaveName = document.getElementById("fileName").value;
    if (!fileSaveName.includes(".png"))
        fileSaveName+=".png";
    DOWNLOAD_BUTTON.download= fileSaveName;
    DOWNLOAD_BUTTON.href= canvas.toDataURL();
    DOWNLOAD_BUTTON.click();
}



function newLayer()
{

}

function removeLayer()
{

}
function deleteAll()
{

}




function updateCanvas()
{
    // Refresh canvas 
    ctx.clearRect(0,0,canvas.width,canvas.height); 

    currentColor = brushStyle.value;

    match = false;
    if ( isPainting )
    {
        // Check to see if pixel is already paitned
        picture[currentLayer].forEach(pixel => 
        {
            if ( pixel.x == brushX && pixel.y == brushY && !match )
                if (!( match = ( pixel.col == currentColor ) ) ) 
                    pixel.col = currentColor;
        });
        
        // If it has not been painted, paint pixel
        if ( ! match  )
            picture[currentLayer].push(new Pixel( brushX, brushY, currentColor));

    }

    if ( isErasing )
    {
        let i = 0;
        picture[currentLayer].forEach(pixel => 
            {
                if (pixel.x == brushX && pixel.y == brushY)
                        picture[currentLayer].splice(i, 1);
                i++;
            });
    }

    // Paint picture
    picture.forEach( layer =>  {
        layer.forEach( pixel => { 
            ctx.fillStyle=pixel.col;
            ctx.fillRect(pixel.x * canvas.width/bits, pixel.y * canvas.height/bits, Math.ceil(background.width/bits), Math.ceil(background.height/bits) ); 
        }); 
    });


    requestAnimationFrame(updateCanvas);
}


requestAnimationFrame(updateCanvas);

document.body.addEventListener("resize", adjustScreen);
window.onresize = adjustScreen;

DOWNLOAD_BUTTON.addEventListener("click", save, false);
adjustScreen();
updateCanvas();





// ペイント      - paint
// フィル        - fill
// 色            - Colours
// レヤー           - Layer
// ピクセルズ