"use strict";
const imageInput = document.getElementById('imageInput');
const imageSize = document.getElementById('imageSize');
const rotateNeg90 = document.getElementById('rotateNeg90');
;
const rotatePos90 = document.getElementById('rotatePos90');
const brightness = document.getElementById('brightness');
const brightnessUp = document.getElementById('brightnessUp');
const brightnessDown = document.getElementById('brightnessDown');
const red = document.getElementById('red');
const redUp = document.getElementById('redUp');
const redDown = document.getElementById('redDown');
const green = document.getElementById('green');
const greenUp = document.getElementById('greenUp');
const greenDown = document.getElementById('greenDown');
const blue = document.getElementById('blue');
const blueUp = document.getElementById('blueUp');
const blueDown = document.getElementById('blueDown');
imageInput.addEventListener('change', loadImage);
rotateNeg90.addEventListener('change', (e) => toggleRotation(e.target));
rotatePos90.addEventListener('change', (e) => toggleRotation(e.target));
let rotate = 0;
// カラー調整用のボタンのidリスト
const colorButtons = ['brightness', 'red', 'green', 'blue'];
// 各ボタンにイベントハンドラを割り当てる
for (const color of colorButtons) {
    const colorElement = document.getElementById(color);
    colorElement.addEventListener('change', () => colorChange());
    /**
     * ボタンが押されている間はカウントアップを続けるイベントハンドラ
     */
    function addClickEvent(buttonId) {
        const el = document.getElementById(buttonId);
        const direction = Number(el.dataset.direction);
        // el.addEventListener('click', (e) => adjustValue(colorElement, direction));
        let isButtonPressed = false;
        let intervalId = null;
        el.addEventListener('mousedown', () => {
            isButtonPressed = true;
            adjustValue(colorElement, direction);
            colorChange();
            // nミリ秒ごとに実行
            const interval = 100;
            intervalId = window.setInterval(() => {
                if (isButtonPressed) {
                    adjustValue(colorElement, direction);
                    colorChange();
                }
                else {
                    clearInterval(intervalId);
                }
            }, interval);
        });
        function stop() {
            isButtonPressed = false;
            clearInterval(intervalId);
        }
        el.addEventListener('mouseup', stop);
        el.addEventListener('mouseleave', stop);
    }
    ;
    addClickEvent(`${color}Up`);
    addClickEvent(`${color}Down`);
}
/**
 * 画像ファイルを読込む
 */
function loadImage() {
    var _a;
    const file = (_a = imageInput.files) === null || _a === void 0 ? void 0 : _a[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        var _a;
        image.src = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
    };
    if (file) {
        reader.readAsDataURL(file);
    }
}
/**
 * クリップボードのpasteイベント
 */
document.addEventListener('paste', (event) => {
    const clipboardData = event.clipboardData;
    if (!clipboardData) {
        return;
    }
    const items = clipboardData.items;
    for (const item of items || []) {
        if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            if (blob) { // 追加のnullチェック
                const reader = new FileReader();
                reader.onload = function (e) {
                    if (e.target) {
                        image.src = e.target.result;
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
function adjustValue(color, direction) {
    let colorValue = parseInt(color.value) || 0;
    colorValue += direction;
    color.value = colorValue.toString();
    console.log("adjustValue", color.value);
}
/**
 * -90° +90°のチェッククリック時
 * @param {HTMLInputElement} checkbox - -90° or +90°
 */
function toggleRotation(checkbox) {
    if (checkbox.checked) {
        rotate = parseInt(checkbox.dataset.rotate);
    }
    else {
        rotate = 0;
    }
    rotateNeg90.checked = (rotate === -90);
    rotatePos90.checked = (rotate === 90);
    console.log(rotate);
}
