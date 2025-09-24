# Split Computing Project

## webアプリの使用
以下のサイトでwebアプリを体験できる。
https://image-classification-33f92.web.app/

## Docker
1. docker-compose build --no-cache
2. docker-compose up --build 
3. docker-compose down 


## ブラウザのエミュレート
以下のコマンドを実行。
```
docker exec selenium python3 /app/browser_script.py
```
http://localhost:7900 からアプリのuiを見ることができる

## netronを用いたモデルの可視化
https://netron.app/ で使用するモデルの.onnxファイルをアップロードすると、モデルを可視化することができる。