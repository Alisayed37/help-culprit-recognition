-- Resets the MySQL root@localhost password to 'password'
ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';
FLUSH PRIVILEGES;
