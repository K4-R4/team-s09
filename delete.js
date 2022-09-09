//SQLiteのインポート
import sqlite3 from 'sqlite3';
//todo.dbの認識
const db = sqlite3.Database("./test.db");

//メモのチェックボックスのリストを表示
    //delete.htmlの(id=lists)formの認識
    let deleteform = document.getElementById("deleteform");
    //todo.dbからデータを取り出し、チェックボックスとして表示
    db.each("select id,text from data",(_err, row) =>{
        let todo = document.createElement("elements");
        todo.className = "lists";
        todo.type = "checkbox";
        todo.value = row.id;
        todo.textContent = row.text;
        deleteform.insertAdjacentHTML("beforeend",todo);
    });


//削除ボタンの機能関数を作る
function deletebtn(){
    let deleteelement = deleteform.getElementsByClassName("elements").value
    db.run("delete from data where id = ?",deleteelement)
}
