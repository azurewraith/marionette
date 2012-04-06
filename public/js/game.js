function BlockMove(event) {
  // Tell Safari not to move the window.
  event.preventDefault() ;
}

//***************************************
// WebStorage test
//***************************************

// Store value on browser for duration of the session
sessionStorage.setItem('key_session', 'value_sess');
 
// Retrieve value (gets deleted when browser is closed and re-opened)
//alert(sessionStorage.getItem('key_session'));

// Store value on the browser beyond the duration of the session
localStorage.setItem('key_local', 'value_loc');
 
// Retrieve value (works even after closing and re-opening the browser)
//alert(localStorage.getItem('key_local'));

//***************************************
// WebSQL test
//***************************************

var db = openDatabase('mydb', '1.0', 'my first database', 2 * 1024 * 1024);
db.transaction(function (tx) {
  tx.executeSql('CREATE TABLE foo (id unique, text)');
  tx.executeSql('INSERT INTO foo (id, text) VALUES (1, "synergies")');
  tx.executeSql('INSERT INTO foo (id, text) VALUES (?, ?)', [2, 4]);

  tx.executeSql('SELECT * FROM foo', [], function (tx, results) {
    var len = results.rows.length, i;
    for (i = 0; i < len; i++) {
      //alert(results.rows.item(i).text);
    }
  });
});