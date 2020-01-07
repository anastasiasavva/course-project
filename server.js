const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");
const moment = require("moment");

const app = express();
const con = mysql.createConnection({
  host: "localhost",
  user: "nastya",
  password: "nastya"
});

con.connect(err => {
  if (err) throw err;

  console.log("Connected!");
  /* создание таблиц */
  con.query("USE nastya;");
  con.query(
    "CREATE TABLE IF NOT EXISTS группа_товаров (" +
      "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
      "название TEXT)"
  );
  con.query(
    "CREATE TABLE IF NOT EXISTS производитель (" +
      "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
      "название TEXT)"
  );
  con.query(
    "CREATE TABLE IF NOT EXISTS товар (" +
      "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
      "название TEXT," +
      "код_группы_товаров INT," +
      "код_производителя INT," +
      "цена INT," +
      "FOREIGN KEY (код_группы_товаров) REFERENCES группа_товаров(id)," +
      "FOREIGN KEY (код_производителя) REFERENCES производитель(id))"
  );
  con.query(
    "CREATE TABLE IF NOT EXISTS поставщик (" +
      "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
      "название TEXT," +
      "контактный_телефон TEXT," +
      "адрес TEXT)"
  );
  con.query(
    "CREATE TABLE IF NOT EXISTS поставка (" +
      "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
      "дата_поставки DATE," +
      "код_товара INT," +
      "код_поставщика INT," +
      "FOREIGN KEY (код_товара) REFERENCES товар(id)," +
      "FOREIGN KEY (код_поставщика) REFERENCES поставщик(id))"
  );
  con.query(
    "CREATE TABLE IF NOT EXISTS сотрудник (" +
      "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
      "фамилия TEXT," +
      "имя TEXT," +
      "должность TEXT," +
      "телефон TEXT)"
  );
  con.query(
    "CREATE TABLE IF NOT EXISTS продажа (" +
      "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
      "количество INT," +
      "код_товара INT," +
      "код_сотрудника INT," +
      "FOREIGN KEY (код_товара) REFERENCES товар(id)," +
      "FOREIGN KEY (код_сотрудника) REFERENCES сотрудник(id))"
  );
  con.query(
    "CREATE TABLE IF NOT EXISTS history  (" +
      "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
      "таблица TEXT NOT NULL, " +
      "операция NVARCHAR(200) NOT NULL)"
  );
  /* руссификция БД*/
  con.query(
    "ALTER DATABASE nastya CHARACTER SET utf8 COLLATE utf8_general_ci;"
  );
  con.query(
    "ALTER TABLE группа_товаров CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
  );
  con.query(
    "ALTER TABLE производитель CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
  );
  con.query(
    "ALTER TABLE товар CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
  );
  con.query(
    "ALTER TABLE поставщик CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
  );
  con.query(
    "ALTER TABLE поставка CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
  );
  con.query(
    "ALTER TABLE сотрудник CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
  );
  con.query(
    "ALTER TABLE продажа CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
  );
  /*------*/
  con.query("DROP TRIGGER IF EXISTS группа_товаров_добавить;");
  con.query("DROP TRIGGER IF EXISTS производитель_добавить;");
  con.query("DROP TRIGGER IF EXISTS товар_добавить;");
  con.query("DROP TRIGGER IF EXISTS поставщик_добавить;");
  con.query("DROP TRIGGER IF EXISTS поставка_добавить;");
  con.query("DROP TRIGGER IF EXISTS сотрудник_добавить;");
  con.query("DROP TRIGGER IF EXISTS продажа_добавить;");

  /* триггер на добавление в таблицу history историй*/
  con.query(
    "CREATE TRIGGER группа_товаров_добавить " +
      "AFTER INSERT " +
      "ON группа_товаров FOR EACH ROW " +
      "BEGIN " +
      "INSERT INTO history (таблица, операция) " +
      `VALUES ("группа_товаров", CONCAT("добавлена группа товаров: ", NEW.название)); ` +
      "END;"
  );
  con.query(
    "CREATE TRIGGER производитель_добавить " +
      "AFTER INSERT " +
      "ON производитель FOR EACH ROW " +
      "BEGIN " +
      "INSERT INTO history (таблица, операция) " +
      `VALUES ("производитель", CONCAT("добавлен производитель: ", NEW.название)); ` +
      "END;"
  );
  con.query(
    "CREATE TRIGGER товар_добавить " +
      "AFTER INSERT " +
      "ON товар FOR EACH ROW " +
      "BEGIN " +
      "INSERT INTO history (таблица, операция) " +
      `VALUES ("товар", CONCAT("добавлен товаро: ", NEW.название)); ` +
      "END;"
  );
  con.query(
    "CREATE TRIGGER поставщик_добавить " +
      "AFTER INSERT " +
      "ON поставщик FOR EACH ROW " +
      "BEGIN " +
      "INSERT INTO history (таблица, операция) " +
      `VALUES ("поставщик", CONCAT("добавлен поставщик: ", NEW.название)); ` +
      "END;"
  );
  con.query(
    "CREATE TRIGGER сотрудник_добавить " +
      "AFTER INSERT " +
      "ON сотрудник FOR EACH ROW " +
      "BEGIN " +
      "INSERT INTO history (таблица, операция) " +
      `VALUES ("сотрудник", CONCAT("добавлена сотрудник: ", NEW.фамилия, " " ,NEW.имя)); ` +
      "END;"
  );

  con.query("DROP VIEW IF EXISTS группы_товаров;");
  con.query("DROP VIEW IF EXISTS производители;");
  con.query("DROP VIEW IF EXISTS товары;");
  con.query("DROP VIEW IF EXISTS продажи;");
  con.query("DROP VIEW IF EXISTS сотрудники;");
  con.query("DROP VIEW IF EXISTS поставки;");

  /* VIEW */ con.query(
    "CREATE VIEW группы_товаров " +
      "AS SELECT " +
      "название " +
      "FROM " +
      "группа_товаров;"
  );
  con.query(
    "CREATE VIEW производители " +
      "AS SELECT " +
      "название " +
      "FROM " +
      "производитель;"
  );
  con.query(
    "CREATE VIEW товары " +
      "AS SELECT " +
      "товар.название AS название, " +
      "товар.цена AS цена, " +
      "группа_товаров.название AS группа_товаров, " +
      "производитель.название AS производитель " +
      "FROM товар " +
      "JOIN группа_товаров ON группа_товаров.id = товар.код_группы_товаров " +
      "JOIN производитель ON производитель.id = товар.код_производителя " +
      "ORDER BY товар.id;"
  );
  con.query(
    "CREATE VIEW поставки " +
      "AS SELECT " +
      "поставка.дата_поставки AS дата_поставки, " +
      "товар.название AS товар, " +
      "поставщик.название AS поставщик " +
      "FROM поставка " +
      "JOIN товар ON товар.id = поставка.код_товара " +
      "JOIN поставщик ON поставщик.id = поставка.код_поставщика " +
      "ORDER BY поставка.id;"
  );
  con.query(
    "CREATE VIEW сотрудники " +
      "AS SELECT " +
      "фамилия, " +
      "имя " +
      "FROM " +
      "сотрудник;"
  );
  con.query(
    "CREATE VIEW продажи " +
      "AS SELECT " +
      "продажа.количество AS количество, " +
      "товар.название AS товар, " +
      "сотрудник.фамилия AS фамилия, " +
      "сотрудник.имя AS имя " +
      "FROM продажа " +
      "JOIN товар ON товар.id = продажа.код_товара " +
      "JOIN сотрудник ON сотрудник.id = продажа.код_сотрудника " +
      "ORDER BY продажа.id;"
  );

  /* процедуры */

  con.query("DROP PROCEDURE IF EXISTS добавить_сотрудника;");
  con.query("DROP PROCEDURE IF EXISTS удалить_сотрудника;");
  con.query(
    "CREATE PROCEDURE добавить_сотрудника (f TEXT, i TEXT, d TEXT, t TEXT) " +
      "BEGIN " +
      "INSERT INTO сотрудник " +
      "(фамилия, имя, должность, телефон) " +
      "VALUES (f, i, d, t); " +
      "END;"
  );
  con.query(
    "CREATE PROCEDURE удалить_сотрудника (i INTEGER) " +
      "BEGIN " +
      `DELETE FROM сотрудник WHERE id=i;` +
      "END;"
  );
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

/* консоль */

app.post("/console", (req, res) => {
  const { query } = req.body;

  con.query(query, (err, result, fields) => {
    console.log(query);
    if (err) res.status(201).send(err);
    if (result) res.status(200).send(result);
  });
});

/* Группа товаров */

app.get("/product_groupe", (req, res) => {
  const query = "SELECT * FROM группа_товаров;";

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

app.get("/product_groupe/:id", (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM группа_товаров WHERE id=${id} LIMIT 1;`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result[0]);
  });
});

app.post("/product_groupe", (req, res) => {
  const { название } = req.body;
  const query =
    "INSERT INTO группа_товаров " + "(название) " + `VALUES ("${название}");`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

app.put("/product_groupe/:id", (req, res) => {
  const { id } = req.params;
  const { название } = req.body;

  const query =
    "UPDATE группа_товаров " + `SET название='${название}' ` + `WHERE id=${id}`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

app.delete("/product_groupe/:id", (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM группа_товаров WHERE id=${id};`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

/* Производитель */

app.get("/factorier", (req, res) => {
  const query = "SELECT * FROM производитель;";

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

app.get("/factorier/:id", (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM производитель WHERE id=${id} LIMIT 1;`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result[0]);
  });
});

app.post("/factorier", (req, res) => {
  const { название } = req.body;
  const query =
    "INSERT INTO производитель " + "(название) " + `VALUES ("${название}");`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

app.put("/factorier/:id", (req, res) => {
  const { id } = req.params;
  const { название } = req.body;

  const query = `UPDATE производитель SET название='${название}' WHERE id=${id}`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

app.delete("/factorier/:id", (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM производитель WHERE id=${id};`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

/* товар */

app.get("/product", (req, res) => {
  const query =
    "SELECT товар.id AS id, товар.название AS название, товар.цена AS цена, " +
    "группа_товаров.название AS группа_товаров, " +
    "производитель.название AS производитель " +
    "FROM товар " +
    "JOIN группа_товаров ON группа_товаров.id = товар.код_группы_товаров " +
    "JOIN производитель ON производитель.id = товар.код_производителя " +
    "ORDER BY id;";

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

app.get("/product/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM товар " + `WHERE товар.id=${id} LIMIT 1;`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result[0]);
  });
});

app.post("/product", (req, res) => {
  const { название, код_группы_товаров, код_производителя, цена } = req.body;

  console.log(req.body);
  const query =
    "INSERT INTO товар " +
    "(название, код_группы_товаров, код_производителя, цена) " +
    `VALUES ("${название}", "${код_группы_товаров}", "${код_производителя}","${цена}");`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

app.put("/product/:id", (req, res) => {
  const { id } = req.params;
  const { название, код_группы_товаров, код_производителя, цена } = req.body;

  const query =
    "UPDATE товар " +
    "SET " +
    `название='${название}', ` +
    `код_группы_товаров='${код_группы_товаров}', ` +
    `код_производителя='${код_производителя}', ` +
    `цена='${цена}' ` +
    `WHERE id=${id}`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

app.delete("/product/:id", (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM товар WHERE id=${id};`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

/* поставщик */

app.get("/provider", (req, res) => {
  const query = "SELECT * FROM поставщик;";

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

app.get("/provider/:id", (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM поставщик WHERE id=${id} LIMIT 1;`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result[0]);
  });
});

app.post("/provider", (req, res) => {
  const { название, контактный_телефон, адрес } = req.body;

  const query =
    "INSERT INTO поставщик " +
    "(название, контактный_телефон, адрес) " +
    `VALUES ("${название}", "${контактный_телефон}", "${адрес}");`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

app.put("/provider/:id", (req, res) => {
  const { id } = req.params;
  const { название, контактный_телефон, адрес } = req.body;

  const query =
    "UPDATE поставщик " +
    "SET " +
    `название='${название}', ` +
    `контактный_телефон='${контактный_телефон}', ` +
    `адрес='${адрес}' ` +
    `WHERE id=${id}`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

app.delete("/provider/:id", (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM поставщик WHERE id=${id};`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

/* поставка */

app.get("/supply", (req, res) => {
  const query =
    "SELECT поставка.id AS id, поставка.дата_поставки AS дата_поставки, " +
    "товар.название AS товар, " +
    "поставщик.название AS поставщик " +
    "FROM поставка " +
    "JOIN товар ON товар.id = поставка.код_товара " +
    "JOIN поставщик ON поставщик.id = поставка.код_поставщика " +
    "ORDER BY id;";

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

app.get("/supply/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM поставка " + `WHERE поставка.id=${id} LIMIT 1;`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send({
      ...result[0],
      дата_поставки: moment(result[0].дата_поставки).format("YYYY-MM-DD")
    });
  });
});

app.post("/supply", (req, res) => {
  const { дата_поставки, код_товара, код_поставщика } = req.body;

  const query =
    "INSERT INTO поставка " +
    "(дата_поставки, код_товара, код_поставщика) " +
    `VALUES ("${дата_поставки}", "${код_товара}","${код_поставщика}");`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

app.put("/supply/:id", (req, res) => {
  const { id } = req.params;
  const { дата_поставки, код_товара, код_поставщика } = req.body;

  const query =
    "UPDATE поставка " +
    "SET " +
    `дата_поставки='${дата_поставки}', ` +
    `код_товара='${код_товара}', ` +
    `код_поставщика='${код_поставщика}' ` +
    `WHERE id=${id}`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

app.delete("/supply/:id", (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM поставка WHERE id=${id};`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

/* сотрудник */

app.get("/employee", (req, res) => {
  const query = "SELECT * FROM сотрудник;";

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

app.get("/employee/:id", (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM сотрудник WHERE id=${id} LIMIT 1;`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result[0]);
  });
});

app.post("/employee", (req, res) => {
  const { фамилия, имя, должность, телефон } = req.body;

  const query =
    "INSERT INTO сотрудник " +
    "(фамилия, имя, должность, телефон) " +
    `VALUES ("${фамилия}", "${имя}", "${должность}", "${телефон}");`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

app.put("/employee/:id", (req, res) => {
  const { id } = req.params;
  const { фамилия, имя, должность, телефон } = req.body;

  const query =
    "UPDATE сотрудник " +
    "SET " +
    `фамилия='${фамилия}', ` +
    `имя='${имя}', ` +
    `должность='${должность}', ` +
    `телефон='${телефон}' ` +
    `WHERE id=${id}`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

app.delete("/employee/:id", (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM сотрудник WHERE id=${id};`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

/* продажа */

app.get("/sale", (req, res) => {
  const query =
    "SELECT продажа.id AS id, продажа.количество AS количество, " +
    "товар.название AS товар, " +
    "сотрудник.фамилия AS фамилия, " +
    "сотрудник.имя AS имя " +
    "FROM продажа " +
    "JOIN товар ON товар.id = продажа.код_товара " +
    "JOIN сотрудник ON сотрудник.id = продажа.код_сотрудника " +
    "ORDER BY id;";

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

app.get("/sale/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM продажа " + `WHERE id=${id} LIMIT 1;`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result[0]);
  });
});

app.post("/sale", (req, res) => {
  const { количество, код_товара, код_сотрудника } = req.body;

  console.log(req.body);
  const query =
    "INSERT INTO продажа " +
    "(количество, код_товара, код_сотрудника) " +
    `VALUES ("${количество}", "${код_товара}", "${код_сотрудника}");`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

app.put("/sale/:id", (req, res) => {
  const { id } = req.params;
  const { количество, код_товара, код_сотрудника } = req.body;

  const query =
    "UPDATE продажа " +
    "SET " +
    `количество='${количество}', ` +
    `код_товара='${код_товара}', ` +
    `код_сотрудника='${код_сотрудника}' ` +
    `WHERE id=${id}`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

app.delete("/sale/:id", (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM продажа WHERE id=${id};`;

  con.query(query, (err, result, fields) => {
    if (err) throw err;
    console.log(query);
    res.send(result);
  });
});

app.listen(8080);

module.exports = app;
