// The `initSqlJs` function is globally provided by all of the main dist files if loaded in the browser.
// We must specify this locateFile function if we are loading a wasm file from anywhere other than the current html page's folder.
config = {
    locateFile: filename => `js/sql/sql-wasm.wasm`
}

var SQL;
initSqlJs(config).then(function (sql) {
    //Create the database
    SQL = sql;
});