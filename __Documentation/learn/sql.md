> create database
```
CREATE DATABASE <_dbName_>
```

> Remove database
```
DROP DATABASE <_dbName_>  [risky]
```

> To Use Created Database
```
Use <_dbName_>
```

> To Create Table
```
CREATE TABLE <_tableName_> ( 
    <_columnName_> <_dataType_> 
)

EX---

CREATE TABLE bands(
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY(id)
)

CREATE TABLE albums(
    id INT NOT NULL AUTO_INCREMENT, 
    name VARCHAR(255) NOT NULL,
    release_year INT, 
    
    band_id INT NOT NULL [ NOT NULL is very important here ]
    PRIMARY KEY(id)
    FOREIGN KEY(band_id) REFERENCES bands(id)
    [ei table er foreign key konta sheta bolte hobe... band_id
    hocche ei table er foreign key. and what table reference..
    shetao bolte hobe ]
)

```

> change property of created table which is called alter table
```
ALTER TABLE <_tableName_> ADD <_colName_> <_dataType_>
```

> delete table / drop table
```
DROP TABLE <_tableName_>
```

> adding / insert data into a table
```
INSERT INTO <_tableName_> (
    <_columnName_>
) VALUES(
    '<_columnValue_>'
)

Another Way ----

INSERT INTO <_tableName_> ( <_columnName_> ) 
VALUES  ( '<_columnValue1_>' ) , ( '<_columnValue2_>' ) 
```

---
> Query
---

>
```
SELECT * FROM <_tableName_>

[return only 2 data]

SELECT * FROM <_tableName_> LIMIT <_limitValue_>

[get certain column]

SELECT <_columnName_> FROM <_tableName_> 

[rename column to make this easier to read]

SELECT <_columnName_> as <_differentColumnName_> FROM <_tableName_>   

```

---
> Where
---

```
SELECT 
```

> 
```

```

> 
```

```

> 
```

```

> 
```

```

> 
```

```

> 
```

```

> 
```

```

> 
```

```

> 
```

```

> 
```

```

> 
```

```

> 
```

```

> 
```

```

> 
```

```

> 
```

```

> 
```

```

> 
```

```

> 
```

```

> 
```

```

> 
```

```

> 
```

```

> 
```

```