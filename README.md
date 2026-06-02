# Bonsai Image WebGPU ライブラリ・リファレンス (README)

本ライブラリは、WebGPUを利用してブラウザ上で完全にローカルかつ高速に動作する、Bonsai画像生成パイプラインの汎用ESM（ES
Modules）パッケージです。
HuggingFace上の軽量かつ高品質な画像生成モデル（`prism-ml/bonsai-image-ternary-4B-mlx-2bit`）をダウンロード・キャッシュし、ブラウザ内で推論処理を実行します。

---
![alt text](<screenshot01.png>)

## ポイント

CompyUIや他の大手画像生成AIアプリ・ライブラリのように、PythonでビルドしたりWindows以外の環境が必要になったりしません。

私自身、いざ試そうとしたらそういう面倒な出会いがあったので、Webだけで動かせるライブラリを目指しました。

参考にさせていただいたのは公式で公開されているデモアプリです。そこからライブラリを作成し、汎用的に使えるようにしたものです。

* 公式HuggingFace: https://huggingface.co/prism-ml
* 公式GitHub: https://github.com/PrismML-Eng/Bonsai-image-demo


## 🚀 クイックスタート

HTML内でライブラリをインポートして画像生成を行うだけで、bonsai-imageを利用することが出来ます。

大手の画像生成AIのフレームワークやアプリのようなゴテゴテとした準備が不要で、このライブラリだけで手軽に画像生成のための準備が完了します。

詳細なサンプルコードは末尾の「付録」をご覧ください。


### デモアプリの実行

デモアプリは次のフォルダにあるHTMLファイルです。

* ./demo/easydemo.html

**実行方法：**

1. コマンドプロンプト等でこのリポジトリ直下のフォルダを開きます。
2. Python で `python -m http.server [任意のポート番号]` を実行します。
3. Webブラウザで、 `http://localhost:ポート番号/demo/easydemo.html` を開きます。

4. CHECK MODELボタンを押すと指定したURLからダウンロード、あるいはキャッシュの読み込みを開始します。
5. Promptや各種設定を変更して、　`Start image generation` ボタンを押します。
6. しばらくすると右側に生成画像が表示されます。（PCスペックにより時間が変わります）

**画面：**

* URL: モデルをURLからダウンロードします。通常はHuggingFaceのモデルのURLを指定します（未入力の場合は `prism-ml/bonsai-image-ternary-4B-mlx-2bit` を使用）。
* Cache: キャッシュしたモデルを使用します。

* Check model: モデルの読み込みを開始します。
* Release from memory: メモリからモデルを解放します。（デモアプリを終了するときや任意でメモリを開放したい場合）
* Clear cache: モデルをキャッシュから削除します。（ブラウザからモデルを削除したい場合）

* Fixed Prompt: 固定で指定したいプロンプト（ブラウザに保存されます）
* Prompt: 通常のプロンプト

* Width: 画像の幅
* Height: 画像の高さ

* Steps: 生成ステップ数
* Seed: シード値

* 進行バー：生成の進捗状況が表示されます。


**注意事項：**

* 一番手軽なPythonによるローカルホスティングを使用しています。他のローカルホスティング方法でも可能なはずです。<br>その場合、ホスティングのルートは必ずリポジトリの大元のフォルダにしてください。

* **⚠️ 対応モデルのバリアントについて（超重要）**：
  Bonsai Image のモデルには、実行環境（バックエンド）に応じて **`-mlx-`** バリアントと **`-gemlite-`** バリアントの2種類が提供されています。
  * **ブラウザ（本 WebGPU ライブラリ）環境でロード可能なのは、`-mlx-` バリアント（例：`prism-ml/bonsai-image-binary-4B-mlx-1bit`）のみです。**
  * **`-gemlite-` バリアント**（例：`prism-ml/bonsai-image-binary-4B-gemlite-1bit`）は PyTorch / CUDA (Python環境) 専用であり、重みの保存形式（`.pt`）やファイル構造が根本的に異なるため、ブラウザ上では 404 (Not Found) 等のエラーとなりロードできません。

* ウェブアクセスは、HuggingFaceからモデルをダウンロードするときのみ必要です。(ダウンロードに時間がかかります)
* 行っていることは公式のWebのデモアプリとほぼ同等です。
* 内部でIndexedDBを使っているので、Node.jsではそのままでは動作しません。

* アプリのUIにはQuasar フレームワークを使用しています。
* 生成した画像は左右にスワイプすると切り替えることが出来ます。
* 生成した画像は右上のボタンからダウンロードできます。

* 公式のデモアプリと同等のモデル取得をしているため、公式の仕様が変わったときは追随できない可能性があります。もし仕様が変わっていたらご一報いただけると助かります。


本ライブラリに関するコード部分には `=== SAMPLE HERE ===` のコメントを付与しています。参考にしてみてください。

### アプリケーションでの使用

次の javascriptファイルを、ご自身のアプリのプロジェクトフォルダのソースフォルダに入れて下さい。

* lib/bonsai-image.js

その後、対象のソースコードにインポートしてください。

```javascript
import { BonsaiImagePipeline } from './bonsai-image.js';
```

#### WebGPUのチェック

実際に使用可能かどうか、ブラウザのWebGPUの対応状況をチェックします。

```javascript
// 1. WebGPUが利用可能かチェック
  const supported = await BonsaiImagePipeline.isSupported();
  if (!supported) {
      alert("この環境はWebGPUをサポートしていません。");
      return;
  }
```

#### モデルの読み込み

モデルをロードします。通常はHuggingFaceの `prism-ml/bonsai-image-ternary-4B-mlx-2bit`　を自動的にダウンロードして、IndexedDBにキャッシュします。
２回目からはIndexedDbから読み込みます。

```javascript
// 2. パイプラインを初期化（自動でIndexedDBキャッシュが働きます）
  const pipeline = await BonsaiImagePipeline.from_pretrained(null, {
      onProgress: (status) => {
          console.log(`ロード進捗 [${status.component}]: ${status.loaded}/${status.total}`);
      }
  });
```

onProgressで進行状況をログや画面に表示できます。

#### 画像生成

画像を生成します。

```javascript
// 3. 画像を生成
  const result = await pipeline.generate({
      prompt: "A beautiful bonsai tree on a misty mountain top, photorealistic, 8k resolution",
      width: 512,
      height: 512,
      numInferenceSteps: 4,
      signal: abortctrl.signal
      seed: Math.floor(Math.random() * 1000000)
  });

  // 4. 結果を表示
  const img = document.createElement("img");
  img.src = await result.toDataURL(); // Data URLに変換
  document.getElementById("output").appendChild(img);
```

詳しい使い方は下記のAPIリファレンスをご覧ください。

キャンセルを受け付ける場合、 AbortController を使用してください。

事前にgenerateメソッドに `signal` に渡しておくと、途中でキャンセルが可能になります。

そして、画像生成後の結果は、 `BonsaiImageResult` クラスのインスタンスが返ってきます。

img要素などには `toDataURL()` を使って表示できます。詳細は`BonsaiImageResult`クラスのリファレンスを見てください。

#### パイプラインの解放

アプリの終了時や任意のタイミングで、WebGPUの解放をしたい場合には `destroy` メソッドを使用します。

```javascript
// パイプラインを解放
await pipeline.destroy();
```





---

## 📖 API リファレンス

### 1. `BonsaiImagePipeline` クラス

画像生成エンジンであるWebGPUパイプライン全体を管理するメインクラスです。

#### 🔹 `static async isSupported()`

動作環境（ブラウザ、OS、グラフィックドライバ）がWebGPUをサポートしているかをチェックする静的メソッドです。

- **引数:** なし
- **戻り値:** `Promise<boolean>`
  - WebGPUが利用可能で、GPUアダプターの取得に成功した場合は
    `true`、利用できない場合は `false` を返します。

---

#### 🔹 `static async from_pretrained(modelId, options)`

事前学習済みモデルを読み込み、画像生成用パイプラインインスタンスを生成・初期化する静的メソッドです。

- **引数:**
  1. `modelId` (`string | null`):
     - 読み込むモデルの識別子。`null` を渡した場合は、デフォルトモデルである
       `prism-ml/bonsai-image-ternary-4B-mlx-2bit` が使用されます。
     - 独自のHuggingFaceリポジトリIDや、ローカルサーバー上のパス（`./models/custom-model`）を指定することも可能です。
  2. `options` (`object`): 初期化構成オプション。
     - `onProgress` (`function`):
       モデル各層のロード進捗をリアルタイムに受け取るコールバック関数。
       - 引数には進捗オブジェクト `status` が渡されます（詳細は後述）。
     - `cache` (`boolean`, デフォルト: `true`):
       - ダウンロードしたモデルをローカルのIndexedDBにキャッシュするかどうか。
     - `cacheName` (`string`, デフォルト: `"bonsai-image-v1"`):
       - IndexedDBに作成されるデータベースの名前。
     - `force` (`boolean`, デフォルト: `false`):
       - `true`
         にすると、既存のIndexedDBキャッシュを無視してネットワークからモデルデータを強制的に再ダウンロードします。
     - `signal` (`AbortSignal`):
       - ロード処理を途中でキャンセルするためのシグナル。
     - `fetch` (`function`, デフォルト: `globalThis.fetch`):
       - カスタムのHTTPフェッチ実装。

- **戻り値:** `Promise<BonsaiImagePipeline>`
  - ロードと初期化が完了した `BonsaiImagePipeline` インスタンスを返します。

##### 💡 `onProgress(status)` コールバックの引数 `status` オブジェクトの構成:

モデルは複数のコンポーネント（Text
Encoder、Transformer、VAE）に分かれており、それぞれ順番にロードされます。

```javascript
{
  component: "text_encoder", // ロード中のコンポーネント名 ('text_encoder', 'transformer', 'vae')
  loaded: 25165824,         // ロード済みのバイト数 (bytes)
  total: 50331648,          // コンポーネント全体の総バイト数 (bytes)
  fromCache: true,          // IndexedDBキャッシュから読み込まれた場合は true、ネットワークからの場合は false
  inFlight: false           // ダウンロード中のアクティブな接続があるか
}
```

---

#### 🔹 `static async clearCache(cacheName = null)`

IndexedDBおよびCache
APIにローカル保存されているモデルのキャッシュデータを完全に削除し、ストレージをクリーンアップします。
再度クリーンにモデルをダウンロードし直したい場合などに有効です。

- **引数:**
  - `cacheName` (`string | null`): クリアするキャッシュの名前。`null`
    の場合は、デフォルトのキャッシュデータベース（`"bonsai-image-v1"`）およびリソースキャッシュ（`"bonsai-pipeline-v1"`）が削除されます。
- **戻り値:** `Promise<void>`
  - キャッシュの削除処理が完了した段階で解決（Resolve）します。

> [!NOTE]
> モデルがロードされたまま（データベース接続が開いた状態）だと削除が一時的にブロックされる場合があるため、キャッシュをクリアする前に必ず
> `pipeline.destroy()` を呼び出してリソースを解放してください。

---

#### 🔹 `getModelName()`

現在パイプラインにロードされているモデルの名前（リポジトリIDなど）を取得します。

- **引数:** なし
- **戻り値:** `string`
  - ロードされているモデルの名前。デフォルトモデルを使用している場合は
    `"prism-ml/bonsai-image-ternary-4B-mlx-2bit"` が返ります。
  - **IndexedDBキャッシュからモデルが高速ロードされた場合でも、正しく元のモデル名が取得できます。**

---

#### 🔹 `async generate(options)`

テキストプロンプトを基に画像を生成します。

- **引数:**
  - `options` (`object`): 生成時の設定パラメータ。
    - `prompt` (`string`, **必須**):
      - 生成したいイメージを記述する英文プロンプト。
    - `width` (`number`, デフォルト: `1024`):
      - 生成する画像の幅（ピクセル単位）。16の倍数（例: `512` や
        `256`）を推奨します。
    - `height` (`number`, デフォルト: `1024`):
      - 生成する画像の高さ（ピクセル単位）。16の倍数を推奨します。
    - `numInferenceSteps` (`number`, デフォルト: `4`):
      - 推論ステップ数（ステップ数が多いほど描き込みが細かくなりますが、生成時間が延びます）。この軽量モデルは4ステップでも驚くほど高品質な画像が生成できます。最大
        `50` まで指定可能です。
    - `seed` (`number`, デフォルト: `0`):
      - 画像生成のランダムシード。同一のシード値とプロンプトを使用すれば、常に全く同じ画像が再現されます。ランダムにする場合は
        `Math.floor(Math.random() * 1000000)` などを渡してください。
    - `guidanceScale` (`number`, デフォルト: `1.0`):
      - ガイダンススケール。現状は軽量化の制約上 `1.0`
        のみが正式サポートされています。
    - `callbackOnStepEnd` (`function`):
      - 各推論ステップの終了ごとに呼び出されるコールバック関数。進捗バーの更新や中間生成プロセスの監視に利用できます。
    - `signal` (`AbortSignal`, デフォルト: `null`):
      - 生成処理を途中でキャンセルするための
        `AbortSignal`。生成ループ内の各ステップの開始前にキャンセルが検知されると、処理を中断して
        `DOMException` ("AbortError")
        をスローします。キャンセル時はメモリリークを起こさずに安全にGPU資源が解放されます。
      - **コールバック関数に渡される主な引数:**
        1. **`pipeline`** (`BonsaiImagePipeline`):
           現在実行中のパイプラインインスタンス。
        2. **`step`** (`number`): 現在完了したステップのインデックス（`0` 〜
           `numInferenceSteps - 1`）。
        3. **`timestep`** (`number`):
           現在のステップに対応するスケジューラーのタイムステップ数値（タイムステップの推移監視用）。
        4. **`{ latents }`** (`object`): 中間の潜在変数テンソル `latents`
           （`BonsaiWebGpuTensor`）を格納したオブジェクト。上級者向けに、中間状態の解析やデコードに利用できます。

- **戻り値:** `Promise<BonsaiImageResult>`
  - 生成されたPNG画像データと生成情報を持つ `BonsaiImageResult`
    インスタンスを返します（詳細は後述）。

---

#### 🔹 `async destroy()`

パイプラインが占有しているWebGPUのアダプターや各種デバイスバッファ、メモリ、テクスチャ資源を明示的に破棄します。アプリケーションがページ遷移する際や、画像生成機能を終了する際に呼び出すことで、ブラウザのメモリリークを完璧に防止します。

- **引数:** なし
- **戻り値:** `Promise<void>`

---

### 2. `BonsaiImageResult` クラス

`pipeline.generate()`
メソッドによって生成された画像データとそのメタデータをカプセル化した結果オブジェクトです。

#### 🔹 インスタンスプロパティ

- `bytes` (`Uint8Array`):
  - 生成されたPNG画像の生データ（バイト配列）。
- `width` (`number`):
  - 生成された画像の横幅（ピクセル）。
- `height` (`number`):
  - 生成された画像の縦幅（ピクセル）。
- `prompt` (`string`):
  - 画像生成に使用されたプロンプトテキスト。
- `seed` (`number`):
  - 画像生成に使用されたシード値。

---

#### 🔹 インスタンスメソッド

##### 1. `toBlob()`

画像データをブラウザの `Blob` オブジェクトに変換します。

- **引数:** なし
- **戻り値:** `Blob` (`type: "image/png"`)
  - `Blob`
    を使用してファイルをダウンロードさせたり、サーバーへアップロード（FormData）したりするのに最適です。

```javascript
const blob = result.toBlob();
// 例: ダウンロードリンクを作る
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "generated-bonsai.png";
a.click();
```

##### 2. `async toDataURL()`

画像をBase64エンコードされたData URLに変換します。そのまま HTML `<img>` 要素の
`src` 属性にセットすることができます。

- **引数:** なし
- **戻り値:** `Promise<string>`
  - `"data:image/png;base64,..."` 形式の文字列。

```javascript
const imgElement = document.getElementById("myImage");
imgElement.src = await result.toDataURL();
```

##### 3. `async toImageBitmap()`

画像をCanvasへの高速な描画やピクセル処理に適した `ImageBitmap`
オブジェクトに変換します。

- **引数:** なし
- **戻り値:** `Promise<ImageBitmap>`
  - 2D Canvasに直接 `drawImage`
    する場合などに、描画パフォーマンスが飛躍的に高まります。

```javascript
const bitmap = await result.toImageBitmap();
const ctx = document.getElementById("myCanvas").getContext("2d");
ctx.drawImage(bitmap, 0, 0);
```

---

## 🛠️ IndexedDBキャッシュによる高速化の仕組み

本ライブラリは、HuggingFace等からの巨大なモデルデータ読み込みを効率化するため、スマートな**IndexedDB分割キャッシュ**を標準搭載しています。

- **初回ロード時**:
  モデルの各レイヤー（safetensors）をインターネットからダウンロードし、バックグラウンドで
  IndexedDB
  内に**分割チャンク（Blob配列）**としてシームレスにキャッシュ保存します。
- **2回目以降の起動**:
  ネットワーク接続は一切行われず、**ローカルのIndexedDBから直接データをストリーミングロード**するため、極めて瞬時に（オフラインであっても）起動可能となります。
- **メリット**:
  モデル全体の巨大なBlobを1つの巨大オブジェクトURLとしてメモリ展開する方式に比べ、メモリ使用量が大幅に抑えられ、低メモリ環境（スマートフォンなど）でもブラウザがクラッシュするのを防止します。

## 付録：素のHTMLによるサンプルコード

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Bonsai Image WebGPU 最小実装</title>
</head>
<body>
    <button id="btn_execute" disabled>実行中...</button>
    <div id="output"></div>

    <script type="module">
        import { BonsaiImagePipeline } from './bonsai-image.js';

        let abortctrl = new AbortController();

        async function init() {
            // 1. WebGPUが利用可能かチェック
            const supported = await BonsaiImagePipeline.isSupported();
            if (!supported) {
                alert("この環境はWebGPUをサポートしていません。");
                return;
            }

            const btn = document.getElementById("btn_execute");
            btn.textContent = "画像生成";
            btn.disabled = false;

            // 2. パイプラインを初期化（自動でIndexedDBキャッシュが働きます）
            const pipeline = await BonsaiImagePipeline.from_pretrained(null, {
                onProgress: (status) => {
                    console.log(`ロード進捗 [${status.component}]: ${status.loaded}/${status.total}`);
                }
            });

            btn.addEventListener("click", async () => {
                btn.disabled = true;
                btn.textContent = "生成中...";

                try {
                    // 3. 画像を生成
                    const result = await pipeline.generate({
                        prompt: "A beautiful bonsai tree on a misty mountain top, photorealistic, 8k resolution",
                        width: 512,
                        height: 512,
                        numInferenceSteps: 4,
                        signal: abortctrl.signal
                        seed: Math.floor(Math.random() * 1000000)
                    });

                    // 4. 結果を表示
                    const img = document.createElement("img");
                    img.src = await result.toDataURL(); // Data URLに変換
                    document.getElementById("output").appendChild(img);

                } catch (error) {
                    if (error.name === "AbortError") {
                      console.log("画像生成がユーザーによりキャンセルされました。(メモリは安全に解放済みです)");
                    } else {
                      console.error("生成中にエラーが発生しました:", error);
                    }
                } finally {
                    btn.disabled = false;
                    btn.textContent = "画像生成";
                }
            });

            document.getElementById("btn_cancel").addEventListener("click", () => {
                abortctrl.abort();
                abortctrl = new AbortController();
            });
        }

        init();
    </script>
</body>
</html>
```

## 付録：🤔 Transformers.js との違いは？（なぜ Bonsai Image なのか）

ブラウザ上で機械学習モデルを動かすライブラリとして非常に有名なのが Hugging Face
の **Transformers.js** です。 「ブラウザで画像生成をするなら Transformers.js
で良いのでは？」と思うかもしれませんが、Bonsai Image
とは**設計思想と技術的アプローチが根本的に異なります**。
結論から言うと、Transformers.js
が**「あらゆるモデルを動かすための汎用大型トレーラー」**であるのに対し、Bonsai
Image
は**「極小モデルをブラウザ上で最速で動かすために限界まで肉抜きされた専用フォーミュラカー」**です。

---
### 📊 技術的な違いの比較

| 項目 | Transformers.js | Bonsai Image (本ライブラリ) |
| :--- | :--- | :--- |
| **実行エンジン** | ONNX Runtime Web (Wasm / WebGPU) | **生のWebGPU (WGSLシェーダーコード直叩き)** |
| **汎用性** | 非常に高い (NLP, 音声, 画像など何でも対応) | 画像生成 (Bonsai / Flux系モデル) に**完全特化** |
| **動作メモリ** | 非常に大きい (数GB〜の空きメモリが必要) | **極めて小さい** (2-bit量子化による圧倒的な省メモリ) |
| **初期ロード時間** | 汎用エンジン自体のロードがあり重め | **超高速** (エンジンが軽量かつIndexedDB分割キャッシュ搭載) |
| **スマホ動作** | 多くの端末でメモリ不足でクラッシュする | **スマートフォンなどのモバイル環境でも軽快に動作** |
---

### 🟢 Bonsai Image (本ライブラリ) のメリット

1. **圧倒的な省メモリと高速起動** ONNX Runtime Web
   などの巨大な仮想実行レイヤーを挟まないため、ブラウザがモデルデータを直接WebGPUメモリ（VRAM）にストリーミングして実行します。そのため、起動が劇的に早く、ブラウザがクラッシュしません。
2. **生WebGPU (WGSL) 特化による最適化**
   モデルのテンソル計算や畳み込み演算（Winograd変換など）が、この軽量モデル（Ternary
   4B /
   2bit）のためだけにWebGPU用のシェーダー言語（WGSL）で手書きチューニングされています。ハードウェアの性能を限界まで引き出せます。
3. **モバイルフレンドリー**
   40億パラメータ（4B）という大規模なモデルでありながら、極小の2-bit量子化モデルと最適化されたメモリ設計により、スマートフォンなどのブラウザでも安定して動きます。

### 🔴 Bonsai Image (本ライブラリ) のデメリット

1. **汎用性がない** Transformers.js
   のように、テキスト翻訳、音声認識、他の多様なAIモデル（BERTやWhisperなど）を同じライブラリで動かすことはできません。
2. **対応モデルが限定的**
   Bonsaiエンジン専用に最適化されたシェーダーで動いているため、任意のSDXLやONNXモデルをそのまま読み込んで実行することはできません（対応モデルのフォーマットに制限があります）。
   また、同じBonsai
   Imageモデルであっても、**Python/CUDA環境用の「-gemlite-」バリアントはロードできず、WebGPU用の「-mlx-」バリアントのみ対応**しています。
