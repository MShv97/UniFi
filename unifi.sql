CREATE DATABASE UbiFi;

CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
	username VARCHAR(255) NOT NULL UNIQUE,
	password VARCHAR(255) NOT NULL,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE folders (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) DEFAULT 'New Floder',
    PRIMARY KEY (id)
);

CREATE TABLE files (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255),
	folderid INT NOT NULL,
    PRIMARY KEY (id),
	FOREIGN KEY (folderid) REFERENCES folders(id)
);

CREATE TABLE user_folders (
	user_id INT,
	folder_id INT,
	PRIMARY KEY (user_id, folder_id),
	FOREIGN KEY (folder_id) REFERENCES folders(id),
	FOREIGN KEY (user_id) REFERENCES users(id)
);