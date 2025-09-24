# Split Computing Project

## ブラウザのエミュレート
以下のコマンドを実行。
```
docker exec selenium python3 /app/browser_script.py
```
http://localhost:7900 からアプリのuiを見ることができる

## Dockerの立ち上げ方
docker-compose build --no-cache
docker-compose up --build 

## netronを用いたモデルの可視化
https://netron.app/ で使用するモデルの.onnxファイルをアップロードすると、モデルを可視化することができる。