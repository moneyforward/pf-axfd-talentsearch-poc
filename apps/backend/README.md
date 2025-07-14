# Reactビルド成果物のSpring Bootへの配置手順

1. Reactプロジェクトをビルドします。

```zsh
cd apps/frontend
npm run build
```

2. ビルド成果物（`dist`ディレクトリの中身）をSpring Bootの `static` ディレクトリにコピーします。

```zsh
cp -r dist/* ../backend/src/main/resources/static/
```

3. Spring Bootアプリケーションを起動します。

```zsh
cd ../backend
./mvnw spring-boot:run
```

- `/api` で始まるリクエストはSpring BootのAPIにディスパッチされます。
- それ以外のリクエストは `static/index.html` を返し、Reactアプリが動作します。
