const imageInput = document.getElementById('imageInput') as HTMLInputElement;
const imageSize = document.getElementById('imageSize') as HTMLInputElement;
const rotateNeg90 = document.getElementById('rotateNeg90') as HTMLInputElement;;
const rotatePos90 = document.getElementById('rotatePos90') as HTMLInputElement;

const brightness = document.getElementById('brightness') as HTMLInputElement;
const brightnessUp = document.getElementById('brightnessUp') as HTMLElement;
const brightnessDown = document.getElementById('brightnessDown') as HTMLElement;

const red = document.getElementById('red') as HTMLInputElement;
const redUp = document.getElementById('redUp') as HTMLElement;
const redDown = document.getElementById('redDown') as HTMLElement;

const green = document.getElementById('green') as HTMLInputElement;
const greenUp = document.getElementById('greenUp') as HTMLElement;
const greenDown = document.getElementById('greenDown') as HTMLElement;

const blue = document.getElementById('blue') as HTMLInputElement;
const blueUp = document.getElementById('blueUp') as HTMLElement;
const blueDown = document.getElementById('blueDown') as HTMLElement;

imageInput.addEventListener('change', loadImage);

rotateNeg90.addEventListener('change', (e) => toggleRotation(e.target as HTMLInputElement));
rotatePos90.addEventListener('change', (e) => toggleRotation(e.target as HTMLInputElement));
let rotate = 0;

// カラー調整用のボタンのidリスト
const colorButtons = ['brightness', 'red', 'green', 'blue'];

// 各ボタンにイベントハンドラを割り当てる
for (const color of colorButtons) {
  const colorElement = document.getElementById(color) as HTMLInputElement;
  /**
   * ボタンが押されている間はカウントアップを続けるイベントハンドラ
   */
  function addClickEvent(buttonId: string) {
    const el = document.getElementById(buttonId) as HTMLInputElement;
    const direction = Number(el.dataset.direction);
    // el.addEventListener('click', (e) => adjustValue(colorElement, direction));
    let isButtonPressed = false;
    let intervalId: number | null = null;
    el.addEventListener('mousedown', () => {
      isButtonPressed = true;
      adjustValue(colorElement, direction);

      // nミリ秒ごとに実行
      const interval = 10;
      intervalId = window.setInterval(() => {
        if (isButtonPressed) {
          adjustValue(colorElement, direction);
        } else {
          clearInterval(intervalId as number);
        }
      }, interval);
    });
    function stop() {
      isButtonPressed = false;
      clearInterval(intervalId as number);
    }
    el.addEventListener('mouseup', stop);
    el.addEventListener('mouseleave', stop);
  };
  addClickEvent(`${color}Up`);
  addClickEvent(`${color}Down`);
}


/**
 * 画像ファイルを読込む
 */
function loadImage() {
  const file = imageInput.files?.[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    image.src = e.target?.result as string;
  };
  if (file) {
    reader.readAsDataURL(file);
  }
}

/**
 * クリップボードのpasteイベント
 */
document.addEventListener('paste', (event) => {
  const clipboardData = (event as ClipboardEvent).clipboardData;
  if (!clipboardData) {
    return;
  }
  const items = clipboardData.items;
  for (const item of items || []) {
    if (item.type.indexOf('image') !== -1) {
      const blob = item.getAsFile();
      if (blob) {  // 追加のnullチェック
        const reader = new FileReader();
        reader.onload = function (e) {
          if (e.target) {
            image.src = e.target.result as string;
            image.style.display = 'block';
          }
        };
        reader.readAsDataURL(blob);
      }
    }
  }
});

/**
 * 明るさの数値を増減させる
 * @param {HTMLInputElement} color （明るさ・赤・緑・青）
 * @param {number} direction 増減値
 */
function adjustValue(color: HTMLInputElement, direction: number) {
  console.log("adjustValue", color);
  let colorValue = parseInt(color.value) || 0;
  colorValue += direction;
  color.value = colorValue.toString();
  convert();
}

/**
 * -90° +90°のチェッククリック時
 * @param {HTMLInputElement} checkbox - -90° or +90°
 */
function toggleRotation(checkbox: HTMLInputElement) {
  if (checkbox.checked) {
    rotate = parseInt(checkbox.dataset.rotate as string);
  } else {
    rotate = 0;
  }
  rotateNeg90.checked = (rotate === -90);
  rotatePos90.checked = (rotate === 90);
  console.log(rotate);
}
