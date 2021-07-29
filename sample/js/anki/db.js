config = {
    locateFile: filename => `js/sql/sql-wasm.wasm`
}

var db = null;
initSqlJs(config).then(function (SQL) {
    //Create the database
    db = new SQL.Database();
    db.run(APKG_SCHEMA);
});