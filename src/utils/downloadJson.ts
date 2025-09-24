/**
 * オブジェクトをJSONファイルとしてブラウザからダウンロードさせる関数
 * @param dataToSave 保存したいデータが含まれるオブジェクト
 * @param fileName ダウンロードするファイル名 (例: 'output.json')
 */
export const downloadJson = (dataToSave: object, fileName: string) => {
  // 1. オブジェクトを整形されたJSON文字列に変換
  const jsonString = JSON.stringify(dataToSave, null, 2);

  // 2. Blobオブジェクトを作成
  const blob = new Blob([jsonString], { type: 'application/json' });

  // 3. BlobへのURLを生成
  const url = URL.createObjectURL(blob);

  // 4. ダウンロード用の<a>タグを生成してクリック
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a); // DOMに追加しないとFirefoxで動作しないことがある
  a.click();

  // 5. 後片付け
  document.body.removeChild(a);
  URL.revokeObjectURL(url); // メモリリークを防ぐためにURLを解放
}
