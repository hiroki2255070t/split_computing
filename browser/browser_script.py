from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

# Selenium Gridのエンドポイント
selenium_endpoint = "http://selenium:4444/wd/hub"

# Chromeオプションの設定
options = Options()
options.add_argument("--no-sandbox")  # セキュリティ制限を緩和（必要に応じて）
options.add_argument("--disable-dev-shm-usage")  # メモリ問題を回避

# WebDriverの初期化
driver = webdriver.Remote(
    command_executor=selenium_endpoint,
    options=options
)

try:
    # テスト用にWebアプリにアクセス
    driver.get("http://webapp:5173")
    print("Navigated to Web app")
    time.sleep(60)  # 60秒待機してUIを確認

finally:
    # セッション終了
    driver.quit()