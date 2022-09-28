# team-s09

# project name
Non sticky めも

# over view
これはデスクトップの壁紙にメモを表示するアプリです。

# features


# 使用技術
言語 (javascript, html, css)<br>
フレームワーク (electron)<br>
ライブラリ (ejs, electron-store, electron, jimp, sqlite3, wallpaper)<br>
インフラ環境 (ユーザーがダウンロードします)<br>

# DEMO動画


# 使い方
git clone<br>
npm start<br>

# create文
 CREATE TABLE tasks(id INTEGER PRIMARY KEY,text TEXT NOT NULL,display BOOLEAN NOT NULL, UpdatedAt TIMESTAMP NOT NULL, deadline TIMESTAMP NOT NULL, IsUseDeadline BOOLEAN NOT NULL DEFAULT false);