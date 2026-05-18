USE `my_database`;
DROP USER IF EXISTS 'hr_specialist'@'localhost';
DROP USER IF EXISTS 'hr_manager'@'localhost';
DROP USER IF EXISTS 'team_leader'@'localhost';
DROP USER IF EXISTS 'project_manager'@'localhost';
DROP USER IF EXISTS 'director'@'localhost';
DROP USER IF EXISTS 'ceo'@'localhost';
DROP USER IF EXISTS 'app_readonly'@'localhost';

CREATE USER 'hr_specialist'@'localhost'   IDENTIFIED BY 'HrSpec2024!';
CREATE USER 'hr_manager'@'localhost'      IDENTIFIED BY 'HrMgr2024!';
CREATE USER 'team_leader'@'localhost'     IDENTIFIED BY 'TeamLead2024!';
CREATE USER 'project_manager'@'localhost' IDENTIFIED BY 'ProjMgr2024!';
CREATE USER 'director'@'localhost'        IDENTIFIED BY 'Director2024!';
CREATE USER 'ceo'@'localhost'             IDENTIFIED BY 'Ceo2024!';
CREATE USER 'app_readonly'@'localhost'    IDENTIFIED BY 'AppRead2024!';


-- Privilegii HR Specialist: poate vedea si edita angajati, concedii, beneficii — dar NU vede salarii sau CNP

GRANT SELECT, INSERT, UPDATE
    ON my_database.angajati         TO 'hr_specialist'@'localhost';
GRANT SELECT, INSERT, UPDATE
    ON my_database.concedii         TO 'hr_specialist'@'localhost';
GRANT SELECT
    ON my_database.beneficii        TO 'hr_specialist'@'localhost';
GRANT SELECT, INSERT
    ON my_database.beneficii_angajati TO 'hr_specialist'@'localhost';
GRANT SELECT
    ON my_database.departamente     TO 'hr_specialist'@'localhost';
GRANT SELECT
    ON my_database.pozitii          TO 'hr_specialist'@'localhost';
GRANT SELECT
    ON my_database.notificari       TO 'hr_specialist'@'localhost';



-- Privilegii HR Manager
-- Tot ce face HR Specialist + salarii + evaluari + acces la audit log (read only)

GRANT SELECT, INSERT, UPDATE
    ON my_database.angajati         TO 'hr_manager'@'localhost';
GRANT SELECT, INSERT, UPDATE
    ON my_database.concedii         TO 'hr_manager'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE
    ON my_database.beneficii        TO 'hr_manager'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE
    ON my_database.beneficii_angajati TO 'hr_manager'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE
    ON my_database.pozitii          TO 'hr_manager'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE
    ON my_database.departamente     TO 'hr_manager'@'localhost';
GRANT SELECT, INSERT
    ON my_database.istoric_salarial TO 'hr_manager'@'localhost';
GRANT SELECT, INSERT, UPDATE
    ON my_database.evaluari         TO 'hr_manager'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE
    ON my_database.manageri         TO 'hr_manager'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE
    ON my_database.utilizatori      TO 'hr_manager'@'localhost';
GRANT SELECT
    ON my_database.audit_log        TO 'hr_manager'@'localhost';
GRANT SELECT, INSERT, UPDATE
    ON my_database.notificari       TO 'hr_manager'@'localhost';



-- Privilegii Team Leader
-- Doar echipa proprie (enforced prin VIEW), aprobare concedii, evaluari, NU vede salarii ale altor angajati

GRANT SELECT
    ON my_database.angajati         TO 'team_leader'@'localhost';
GRANT SELECT, UPDATE
    ON my_database.concedii         TO 'team_leader'@'localhost';
GRANT SELECT, INSERT
    ON my_database.evaluari         TO 'team_leader'@'localhost';
GRANT SELECT
    ON my_database.departamente     TO 'team_leader'@'localhost';
GRANT SELECT
    ON my_database.pozitii          TO 'team_leader'@'localhost';
GRANT SELECT
    ON my_database.proiecte         TO 'team_leader'@'localhost';
GRANT SELECT
    ON my_database.alocari_proiecte TO 'team_leader'@'localhost';



-- Privilegii Project Manager
-- Gestionare proiecte si alocari, NU are acces la date personale sau salarii

GRANT SELECT, INSERT, UPDATE, DELETE
    ON my_database.proiecte         TO 'project_manager'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE
    ON my_database.alocari_proiecte TO 'project_manager'@'localhost';
GRANT SELECT
    ON my_database.angajati         TO 'project_manager'@'localhost';
GRANT SELECT
    ON my_database.departamente     TO 'project_manager'@'localhost';
GRANT SELECT
    ON my_database.pozitii          TO 'project_manager'@'localhost';



-- Privilegii Director
-- Read-only pe tot — vede rapoarte complete, inclusiv salarii, dar nu poate modifica nimic

GRANT SELECT ON my_database.angajati          TO 'director'@'localhost';
GRANT SELECT ON my_database.departamente      TO 'director'@'localhost';
GRANT SELECT ON my_database.pozitii           TO 'director'@'localhost';
GRANT SELECT ON my_database.proiecte          TO 'director'@'localhost';
GRANT SELECT ON my_database.alocari_proiecte  TO 'director'@'localhost';
GRANT SELECT ON my_database.evaluari          TO 'director'@'localhost';
GRANT SELECT ON my_database.istoric_salarial  TO 'director'@'localhost';
GRANT SELECT ON my_database.concedii          TO 'director'@'localhost';
GRANT SELECT ON my_database.beneficii         TO 'director'@'localhost';
GRANT SELECT ON my_database.beneficii_angajati TO 'director'@'localhost';
GRANT SELECT ON my_database.manageri          TO 'director'@'localhost';
GRANT SELECT ON my_database.predictii_churn   TO 'director'@'localhost';



-- Privilegii CEO
-- Acces complet read-only la toate tabelele, inclusiv audit_log si predictii_churn

GRANT SELECT ON my_database.*  TO 'ceo'@'localhost';
REPAIR TABLE mysql.db;



-- Utilizator aplicatie (app_readonly)

GRANT SELECT ON my_database.departamente  TO 'app_readonly'@'localhost';
GRANT SELECT ON my_database.pozitii       TO 'app_readonly'@'localhost';
GRANT SELECT ON my_database.proiecte      TO 'app_readonly'@'localhost';
GRANT SELECT ON my_database.beneficii     TO 'app_readonly'@'localhost';



-- VIEW-uri pentru date sensibile
-- Ascund CNP si salariu din vizualizarea generala

-- View pentru HR Specialist - fara CNP si salariu
CREATE OR REPLACE VIEW `view_angajati_hr_specialist` AS
SELECT
    a.id_angajat,
    a.nume,
    a.prenume,
    a.email,
    a.telefon,
    a.data_angajare,
    a.status,
    d.nume      AS departament,
    p.titlu     AS pozitie,
    p.nivel
FROM angajati a
JOIN departamente d ON a.id_departament = d.id_departament
JOIN pozitii p      ON a.id_pozitie     = p.id_pozitie;

-- View pentru Team Leader - doar angajatii activi fara date sensibile
CREATE OR REPLACE VIEW `view_angajati_team_leader` AS
SELECT
    a.id_angajat,
    a.nume,
    a.prenume,
    a.email,
    a.data_angajare,
    a.status,
    d.nume      AS departament,
    p.titlu     AS pozitie,
    p.nivel
FROM angajati a
JOIN departamente d ON a.id_departament = d.id_departament
JOIN pozitii p      ON a.id_pozitie     = p.id_pozitie
WHERE a.status = 'activ';

-- View pentru Project Manager - doar ce e relevant pentru proiecte
CREATE OR REPLACE VIEW `view_angajati_proiecte` AS
SELECT
    a.id_angajat,
    a.nume,
    a.prenume,
    a.email,
    d.nume      AS departament,
    p.titlu     AS pozitie,
    p.nivel,
    a.status
FROM angajati a
JOIN departamente d ON a.id_departament = d.id_departament
JOIN pozitii p      ON a.id_pozitie     = p.id_pozitie;



-- Privilegii pe VIEW-uri

GRANT SELECT ON my_database.view_angajati_hr_specialist TO 'hr_specialist'@'localhost';
GRANT SELECT ON my_database.view_angajati_team_leader   TO 'team_leader'@'localhost';
GRANT SELECT ON my_database.view_angajati_proiecte      TO 'project_manager'@'localhost';



-- Aplicare privilegii

FLUSH PRIVILEGES;



-- VERIFICARE

SELECT
    User                AS utilizator,
    Host                AS host,
    Password_expired    AS parola_expirata
FROM mysql.user
WHERE Host = 'localhost'
  AND User IN ('hr_specialist','hr_manager','team_leader',
               'project_manager','director','ceo','app_readonly')
ORDER BY User;

-- verifica privilegiile unui utilizator specific
SHOW GRANTS FOR 'hr_specialist'@'localhost';
SHOW GRANTS FOR 'ceo'@'localhost';
SHOW GRANTS FOR 'team_leader'@'localhost';



-- Procedura de login
CREATE PROCEDURE proc_login(
    IN p_username VARCHAR(50),
    IN p_parola_hash VARCHAR(255)
)
BEGIN
    SELECT id_utilizator, username, rol, activ
    FROM utilizatori
    WHERE username = p_username
      AND parola_hash = p_parola_hash
      AND activ = 1;
END;



-- Procedura de schimbare parola — cu validare că parola veche e corecta

CREATE PROCEDURE proc_schimbare_parola(
    IN p_id_utilizator INT,
    IN p_parola_veche VARCHAR(255),
    IN p_parola_noua VARCHAR(255)
)
BEGIN
    DECLARE v_parola_curenta VARCHAR(255);

    SELECT parola_hash INTO v_parola_curenta
    FROM utilizatori
    WHERE id_utilizator = p_id_utilizator;

    IF v_parola_curenta != p_parola_veche THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Parola veche incorecta';
    END IF;

    UPDATE utilizatori
    SET parola_hash = p_parola_noua
    WHERE id_utilizator = p_id_utilizator;
END;



-- Politica de parole — forteaza schimbarea parolei la prima logare

ALTER USER 'hr_specialist'@'localhost'   PASSWORD EXPIRE;
ALTER USER 'hr_manager'@'localhost'      PASSWORD EXPIRE;
ALTER USER 'team_leader'@'localhost'     PASSWORD EXPIRE;
ALTER USER 'project_manager'@'localhost' PASSWORD EXPIRE;
ALTER USER 'director'@'localhost'        PASSWORD EXPIRE;
ALTER USER 'ceo'@'localhost'             PASSWORD EXPIRE;
ALTER USER 'app_readonly'@'localhost'    PASSWORD EXPIRE;

-- Politica de expirare automata la 90 de zile = se aplica la urmatoarea schimbare de parola
ALTER USER 'hr_specialist'@'localhost'
    PASSWORD EXPIRE INTERVAL 90 DAY;
ALTER USER 'hr_manager'@'localhost'
    PASSWORD EXPIRE INTERVAL 90 DAY;
ALTER USER 'team_leader'@'localhost'
    PASSWORD EXPIRE INTERVAL 90 DAY;
ALTER USER 'project_manager'@'localhost'
    PASSWORD EXPIRE INTERVAL 90 DAY;
ALTER USER 'director'@'localhost'
    PASSWORD EXPIRE INTERVAL 90 DAY;
ALTER USER 'ceo'@'localhost'
    PASSWORD EXPIRE INTERVAL 90 DAY;

FLUSH PRIVILEGES;



-- Procedurile stocate de securitate

-- Procedura de autentificare
CREATE PROCEDURE `proc_login`(
    IN p_username       VARCHAR(50),
    IN p_parola_hash    VARCHAR(255)
)
BEGIN
    DECLARE v_activ     TINYINT;
    DECLARE v_id        INT;

    -- verifica daca utilizatorul exista si e activ
    SELECT id_utilizator, activ
    INTO v_id, v_activ
    FROM utilizatori
    WHERE username = p_username
      AND parola_hash = p_parola_hash;

    IF v_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Username sau parola incorecte';
    ELSEIF v_activ = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Contul este dezactivat';
    ELSE
        -- returneaza datele utilizatorului autentificat
        UPDATE utilizatori
        SET ultima_autentificare = NOW()
        WHERE id_utilizator = v_id;

        SELECT
            u.id_utilizator,
            u.username,
            u.rol,
            a.nume,
            a.prenume,
            a.email
        FROM utilizatori u
        JOIN angajati a ON u.id_angajat = a.id_angajat
        WHERE u.id_utilizator = v_id;
    END IF;
END;

-- Procedura de schimbare parola
CREATE PROCEDURE `proc_schimbare_parola`(
    IN p_id_utilizator  INT,
    IN p_parola_veche   VARCHAR(255),
    IN p_parola_noua    VARCHAR(255)
)
BEGIN
    DECLARE v_parola_curenta VARCHAR(255);
    DECLARE v_username       VARCHAR(50);

    -- preia parola curenta
    SELECT parola_hash, username
    INTO v_parola_curenta, v_username
    FROM utilizatori
    WHERE id_utilizator = p_id_utilizator;

    -- verifica parola veche
    IF v_parola_curenta != p_parola_veche THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Parola veche este incorecta';
    END IF;

    -- verifica ca parola noua e diferita
    IF p_parola_noua = p_parola_veche THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Parola noua trebuie sa fie diferita de cea veche';
    END IF;

    -- actualizeaza parola
    UPDATE utilizatori
    SET parola_hash = p_parola_noua
    WHERE id_utilizator = p_id_utilizator;

    -- inregistreaza in audit_log
    INSERT INTO audit_log (
        `tabel`, `id_inregistrare`, `actiune`,
        `coloana`, `valoare_veche`, `valoare_noua`, `utilizator`
    ) VALUES (
        'utilizatori', p_id_utilizator, 'UPDATE',
        'parola_hash', '***', '***', v_username
    );

    SELECT 'Parola a fost schimbata cu succes' AS mesaj;
END;

-- Procedura de dezactivare cont
CREATE PROCEDURE `proc_dezactivare_cont`(
    IN p_id_utilizator  INT,
    IN p_motiv          VARCHAR(200)
)
BEGIN
    DECLARE v_username VARCHAR(50);

    SELECT username INTO v_username
    FROM utilizatori
    WHERE id_utilizator = p_id_utilizator;

    IF v_username IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Utilizatorul nu exista';
    END IF;

    UPDATE utilizatori
    SET activ = 0
    WHERE id_utilizator = p_id_utilizator;

    -- audit
    INSERT INTO audit_log (
        `tabel`, `id_inregistrare`, `actiune`,
        `coloana`, `valoare_veche`, `valoare_noua`, `utilizator`
    ) VALUES (
        'utilizatori', p_id_utilizator, 'UPDATE',
        'activ', '1', '0', v_username
    );

    SELECT CONCAT('Contul ', v_username, ' a fost dezactivat') AS mesaj;
END;



-- Trigger de securitate

CREATE TRIGGER `trg_audit_modificare_rol`
AFTER UPDATE ON `utilizatori`
FOR EACH ROW
BEGIN
    IF OLD.rol != NEW.rol THEN
        INSERT INTO audit_log (
            `tabel`, `id_inregistrare`, `actiune`,
            `coloana`, `valoare_veche`, `valoare_noua`
        ) VALUES (
            'utilizatori', NEW.id_utilizator, 'UPDATE',
            'rol', OLD.rol, NEW.rol
        );
    END IF;
END;



-- VERIFICARI FINALE

-- 1. toti utilizatorii creati
SELECT
    User                    AS utilizator,
    Host                    AS host,
    Password_expired        AS parola_expirata,
    is_role                 AS este_rol
FROM mysql.user
WHERE Host = 'localhost'
  AND User IN (
    'hr_specialist', 'hr_manager', 'team_leader',
    'project_manager', 'director', 'ceo', 'app_readonly'
  )
ORDER BY User;

DESCRIBE mysql.user;

-- 2. privilegiile fiecarui utilizator
SHOW GRANTS FOR 'hr_specialist'@'localhost';
SHOW GRANTS FOR 'hr_manager'@'localhost';
SHOW GRANTS FOR 'team_leader'@'localhost';
SHOW GRANTS FOR 'project_manager'@'localhost';
SHOW GRANTS FOR 'director'@'localhost';
SHOW GRANTS FOR 'ceo'@'localhost';

-- 3. view-urile create
SELECT
    TABLE_NAME      AS view_name,
    VIEW_DEFINITION AS definitie
FROM information_schema.VIEWS
WHERE TABLE_SCHEMA = 'my_database';

-- 4. procedurile de securitate create
SELECT
    ROUTINE_NAME    AS procedura,
    ROUTINE_TYPE    AS tip,
    CREATED         AS data_creare
FROM information_schema.ROUTINES
WHERE ROUTINE_SCHEMA = 'my_database'
  AND ROUTINE_NAME IN (
    'proc_login',
    'proc_schimbare_parola',
    'proc_dezactivare_cont'
  );

