const invertColors = document.getElementById('invertColors') as HTMLInputElement;
const image = document.getElementById('displayedImage') as HTMLImageElement;
const execute = document.getElementById('execute') as HTMLElement;
const makeHint = document.getElementById('makeHint') as HTMLElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const grid = document.getElementById("grid") as HTMLElement;

execute.addEventListener('click', convert);
makeHint.addEventListener('click', makeHints);
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

let pixelArray: RGBAColor[][];

/**
 * 白黒画像からお絵かきロジックのヒントを作成し、クリップボードにコピーする
 */
function makeHints() {
  console.log('makeHints');
  const masArray = convertToBlackOrWhite(pixelArray, Number(brightness.value), Number(red.value), Number(green.value), Number(blue.value));

  let clipText: string = "";

  //masArrayの行と列を入れ替えて縦のヒントを作成
  const transform = Array.from({ length: masArray[0].length }, (_, i) => masArray.map(row => row[i]))
  const colHInts = makeHintArray(transform);
  console.log('[縦ヒント]' + '\n' + colHInts.join('\n') + '\n');
  clipText += '\t' + colHInts.join('\t') + '\n';

  //横のヒントを作成
  const rowHInts = makeHintArray(masArray);
  console.log('[横ヒント]' + '\n' + rowHInts.join('\n') + '\n');
  clipText += rowHInts.join('\n') + '\n';
  navigator.clipboard.writeText(clipText)
}
/**
 * 2次元masArray配列からお絵かきロジックのヒント配列を生成する
 * @param {CellColor[][]} masArray - 2次元配列(値は白か黒)
 * @returns {string[]} - 例["1,2","3","1,1"]
 */
function makeHintArray(masArray: CellColor[][]): string[] {
  const result: string[] = [];
  const Cols = masArray[0].length;
  const Rows = masArray.length;
  for (let y = 0; y < Rows; y++) {
    let blackCounter = 0;
    const blackCounterArray: number[] = [];
    //もしimageArray[y][x]が1の場合、blackCounterを増やす
    //違えばblackCounterの値を配列にpush
    for (let x = 0; x < Cols; x++) {
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

  let width = 0;
  let height = 0;

  if (!pixelArray) {
    //サイズを変更
    width = parseInt(imageSize.value);
    height = parseInt(imageSize.value) * image.height / image.width;

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);

    pixelArray = createPixelArray(ctx.getImageData(0, 0, width, height).data, width, height);
  } else {
    width = canvas.width;
    height = canvas.height;
  }

  const MasArray = convertToBlackOrWhite(pixelArray, Number(brightness.value), Number(red.value), Number(green.value), Number(blue.value));

  //サイズを示す文字列を生成（"Xpx Xpx Xpx ..."）
  const gridColumns = `repeat(${width}, 5px)`;
  const gridRows = `repeat(${height}, 5px)`;

  // グリッドのスタイルを設定
  // 子要素をすべて削除
  while (grid.firstChild) {
    grid.removeChild(grid.firstChild);
  }
  const grid2: HTMLDivElement[][] = [];
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

      if (MasArray[row][col] === CellColor.White) {
        cell.style.backgroundColor = "white";
      } else if (MasArray[row][col] === CellColor.Black) {
        cell.style.backgroundColor = "black";
      }
      rowArray.push(cell);
    }
    grid2.push(rowArray);
  }
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      grid.appendChild(grid2[row][col]);
    }
  }

  // 画像を表示
  // ctx?.putImageData(newImageData!, 0, 0);
  image.style.display = 'none';
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
  const grid: CellColor[][] = [];
  for (let y = 0; y < pixelArray.length; y++) {
    const row: CellColor[] = [];
    for (let x = 0; x < pixelArray[y].length; x++) {
      const pixel: RGBAColor = pixelArray[y][x];
      pixel.red = pixel.red * (1 + red / 100);
      pixel.green = pixel.green * (1 + green / 100);
      pixel.blue = pixel.blue * (1 + blue / 100);
      const average = (pixel.red + pixel.green + pixel.blue) / 3;

      //各色の閾値を超えているかどうかを確認して白黒に変換
      // const isWhite = brightness > brightness ||
      //   pixel.red > red ||
      //   pixel.green > green ||
      //   pixel.blue > blue;
      let isWhite = (average > 127 + brightness);
      if (invertColors.checked == true) isWhite = !isWhite;
      // 白なら1、黒なら0を設定
      const convertedPixel: CellColor = isWhite ? 1 : 0;
      row.push(convertedPixel);
    }
    grid.push(row);
  }
  return grid;
}
/**
 * 与えられたRGBAColor型の二次元配列からImageDataオブジェクトを生成する関数
 * @param {RGBAColor[][]} pixelArray - 変換対象のRGBAColor型の二次元配列
 * @returns {ImageData} - 生成されたImageDataオブジェクト
 */
function createImageDataFromPixelArray(pixelArray: RGBAColor[][]): ImageData {
  const width = pixelArray[0].length;
  const height = pixelArray.length;
  const imageData = new ImageData(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      imageData.data[index] = pixelArray[y][x].red;
      imageData.data[index + 1] = pixelArray[y][x].green;
      imageData.data[index + 2] = pixelArray[y][x].blue;
      imageData.data[index + 3] = pixelArray[y][x].alpha * 255;  // アルファは0から1の範囲なので255倍して整数に変換
    }
  }
  return imageData;
}

