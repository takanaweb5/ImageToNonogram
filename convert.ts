const invertColors = document.getElementById('invertColors') as HTMLInputElement;
const image = document.getElementById('displayedImage') as HTMLImageElement;
const execute = document.getElementById('execute') as HTMLElement;
const makeHint = document.getElementById('makeHint') as HTMLElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const grid = document.getElementById("grid") as HTMLElement;

execute.addEventListener('click', convert);
makeHint.addEventListener('click', makeHints);
let Cells: HTMLDivElement[][];

type RGBAColor = {
  red: number;
  green: number;
  blue: number;
  alpha: number;
};

enum CellColor {
  White = 1,
  Black = 0,
  Unknown = '',
}

const MassColorMap = {
  [CellColor.White]: "white",
  [CellColor.Black]: "black",
  [CellColor.Unknown]: "gray",
};

let PixelArray: RGBAColor[][];

/**
 * 白黒画像からお絵かきロジックのヒントを作成し、クリップボードにコピーする
 */
function makeHints() {
  console.log('makeHints');
  const massArray = convertToBlackOrWhite(PixelArray, Number(brightness.value), Number(red.value), Number(green.value), Number(blue.value));

  //masArrayの行と列を入れ替えて縦のヒントを作成
  const transform = Array.from({ length: massArray[0].length }, (_, i) => massArray.map(row => row[i]))
  const colHInts = makeHintArray(transform);
  console.log('[縦ヒント]' + '\n' + colHInts.join('\n') + '\n');

  //横のヒントを作成
  const rowHInts = makeHintArray(massArray);
  console.log('[横ヒント]' + '\n' + rowHInts.join('\n') + '\n');

  const clipText = '\t' + colHInts.join('\t') + '\n' + rowHInts.join('\n') + '\n';
  navigator.clipboard.writeText(clipText)
}
/**
 * 2次元masArray配列からお絵かきロジックのヒント配列を生成する
 * @param {CellColor[][]} masArray - 2次元配列(値は白か黒)
 * @returns {string[]} - 例["1,2","3","1,1"]
 */
function makeHintArray(masArray: CellColor[][]): string[] {
  const result: string[] = [];
  const cols = masArray[0].length;
  const rows = masArray.length;
  for (let y = 0; y < rows; y++) {
    let blackCounter = 0;
    const blackCounterArray: number[] = [];
    //もしimageArray[y][x]が1の場合、blackCounterを増やす
    //違えばblackCounterの値を配列にpush
    for (let x = 0; x < cols; x++) {
      if (masArray[y][x] === CellColor.Black) {
        blackCounter++;
      } else {
        if (blackCounter > 0) {
          blackCounterArray.push(blackCounter);
          blackCounter = 0;
        }
      }
    }
    if (blackCounter > 0) {
      blackCounterArray.push(blackCounter);
    }
    //blackCounterArrayに格納された値を,区切りの文字列のして配列にpush
    const hint = blackCounterArray.length > 0 ? blackCounterArray.join(',') : "0";
    result.push(hint);
  }
  return result;
}

/**
 * テキストをクリップボードにコピーする関数
 * @param {string} text - コピーするテキスト
 */
// function copyToClipboard(text: string) {
//   // Clipboard APIがサポートされているか確認
//   if (!navigator.clipboard) {
//     console.error('Clipboard APIはサポートされていません');
//     return;
//   }

//   // テキストをクリップボードにコピー
//   navigator.clipboard.writeText(text)
//     .then(() => {
//       console.log('クリップボードにコピーしました: ', text);
//     })
//     .catch(err => {
//       console.error('クリップボードにコピーできませんでした: ', err);
//     });
// }

async function convert() {
  console.log('convert');

  //サイズを変更
  const width = parseInt(imageSize.value);
  const height = parseInt(imageSize.value) * image.height / image.width;

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0, width, height);

  PixelArray = createPixelArray(ctx.getImageData(0, 0, width, height).data, width, height);

  const massArray = convertToBlackOrWhite(PixelArray, Number(brightness.value), Number(red.value), Number(green.value), Number(blue.value));

  //サイズを示す文字列を生成（"Xpx Xpx Xpx ..."）
  const gridColumns = `repeat(${width}, 5px)`;
  const gridRows = `repeat(${height}, 5px)`;

  // グリッドのスタイルを設定
  // 子要素をすべて削除
  while (grid.firstChild) {
    grid.removeChild(grid.firstChild);
  }
  Cells = [];
  grid.style.gridTemplateColumns = gridColumns;
  grid.style.gridTemplateRows = gridRows;
  for (let row = 0; row < height; row++) {
    const rowArray: HTMLDivElement[] = [];
    for (let col = 0; col < width; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      // cell.addEventListener("click", function () {
      //   //ここにトグル処理を
      // });
      grid.appendChild(cell);
      rowArray.push(cell);
    }
    Cells.push(rowArray);
  }

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      Cells[row][col].style.backgroundColor = MassColorMap[massArray[row][col]];
    }
  }
  image.style.display = 'none';
}
function colorChange() {
  console.log('colorChange');
  const width = canvas.width;
  const height = canvas.height;
  const massArray = convertToBlackOrWhite(PixelArray, Number(brightness.value), Number(red.value), Number(green.value), Number(blue.value));
  console.log(width,height);
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      Cells[row][col].style.backgroundColor = "red";
      Cells[row][col].style.backgroundColor = MassColorMap[massArray[row][col]];
      console.log(row,col);
    }
  }
}

/**
 * 与えられたUint8ClampedArrayからRGBAColor型の二次元配列を生成する関数
 * @param {Uint8ClampedArray} data - キャンバスのピクセルデータを含むUint8ClampedArray
 * @returns {RGBAColor[][]} - 生成されたRGBAColor型の二次元配列
 */
function createPixelArray(data: Uint8ClampedArray, width: number, height: number): RGBAColor[][] {
  const pixelArray: RGBAColor[][] = [];
  for (let y = 0; y < height; y++) {
    const row: RGBAColor[] = [];
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const pixel: RGBAColor = {
        red: data[i],
        green: data[i + 1],
        blue: data[i + 2],
        alpha: data[i + 3]
      };
      row.push(pixel);
    }
    pixelArray.push(row);
  }
  return pixelArray;
}

/**
 * 与えられたRGBAColor型の二次元配列を白黒に変換する関数
 * @param {RGBAColor[][]} pixelArray - 変換対象のRGBAColor型の二次元配列
 * @param {number} brightness - 明るさの閾値
 * @param {number} red - 赤の閾値
 * @param {number} green - 緑の閾値
 * @param {number} blue - 青の閾値
 * @returns {RGBAColor[][]} - 白黒に変換されたRGBAColor型の二次元配列
 */
function convertToBlackOrWhite(pixelArray: RGBAColor[][], brightness: number, red: number, green: number, blue: number): CellColor[][] {
  console.log('convertToBlackOrWhite' + ` brightness:${brightness}  red:${red}  green:${green}  blue:${blue}`);
  const result: CellColor[][] = [];
  for (let y = 0; y < pixelArray.length; y++) {
    const row: CellColor[] = [];
    for (let x = 0; x < pixelArray[y].length; x++) {
      const pixel: RGBAColor = pixelArray[y][x];
      pixel.red = pixel.red * (1 + red / 100);
      pixel.green = pixel.green * (1 + green / 100);
      pixel.blue = pixel.blue * (1 + blue / 100);
      const average = (pixel.red + pixel.green + pixel.blue) / 3;

      let isWhite = (average > 127 + brightness);
      if (invertColors.checked == true) isWhite = !isWhite;
      // 白なら1、黒なら0を設定
      const convertedPixel: CellColor = isWhite ? 1 : 0;
      row.push(convertedPixel);
    }
    result.push(row);
  }
  return result;
}

