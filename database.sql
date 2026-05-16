CREATE DATABASE `my_database`;
USE `my_database`;

SELECT * FROM `angajati`;
SELECT * FROM `departamente`;
SELECT * FROM `pozitii`;
SELECT * FROM `proiecte`;
SELECT * FROM `alocari_proiecte`;
SELECT * FROM `beneficii`;
SELECT * FROM `beneficii_angajati`;
SELECT * FROM `concedii`;
SELECT * FROM `evaluari`;
SELECT * FROM `istoric_salarial`;
SELECT * FROM `manageri`;
SELECT * FROM `notificari`;
SELECT * FROM `utilizatori`;



-- Creare tabele

CREATE TABLE `alocari_proiecte` (
  `id_alocare` int(11) NOT NULL,
  `id_angajat` int(11) NOT NULL,
  `id_proiect` int(11) NOT NULL,
  `rol_proiect` varchar(30) DEFAULT NULL,
  `ore_alocate` int(11) DEFAULT NULL,
  `data_start` date DEFAULT NULL,
  `data_sfarsit` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `angajati` (
  `id_angajat` int(11) NOT NULL,
  `nume` varchar(100) DEFAULT NULL,
  `prenume` varchar(30) NOT NULL,
  `cnp` varchar(13) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefon` varchar(255) NOT NULL,
  `data_angajare` date NOT NULL,
  `id_departament` int(11) NOT NULL,
  `id_pozitie` int(11) NOT NULL,
  `id_manager` int(11) DEFAULT NULL,
  `status` enum('activ','inactiv') NOT NULL DEFAULT 'activ'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `beneficii` (
  `id_beneficiu` int(11) NOT NULL,
  `nume` varchar(30) NOT NULL,
  `descriere` text NOT NULL,
  `valoare` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `beneficii_angajati` (
  `id_angajat` int(11) NOT NULL,
  `id_beneficiu` int(11) NOT NULL,
  `data_acordare` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `concedii` (
  `id_concediu` int(11) NOT NULL,
  `id_angajat` int(11) NOT NULL,
  `id_aprobator` int(11) NOT NULL,
  `tip` enum('odihna','boala','concediu fara plata') NOT NULL,
  `data_start` date NOT NULL,
  `data_sfarsit` date NOT NULL,
  `status` enum('aprobat','respins','in asteptare') NOT NULL DEFAULT 'in asteptare'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `departamente` (
  `id_departament` int(11) NOT NULL,
  `nume` varchar(30) NOT NULL,
  `locatie` varchar(60) NOT NULL,
  `id_manager` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `evaluari` (
  `id_evaluare` int(11) NOT NULL,
  `id_angajat` int(11) NOT NULL,
  `id_evaluator` int(11) NOT NULL,
  `data_evaluare` date NOT NULL,
  `scor tehnic` int(11) NOT NULL,
  `scor_comunicare` int(11) NOT NULL,
  `scor_leadership` int(11) NOT NULL,
  `scor_final` decimal(5,2) NOT NULL,
  `feedback` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `istoric_salarial` (
  `id_istoric` int(11) NOT NULL,
  `id_angajat` int(11) NOT NULL,
  `salariu_vechi` decimal(7,2) NOT NULL,
  `salariu_nou` decimal(7,2) NOT NULL,
  `data_modificare` date NOT NULL,
  `motiv` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `manageri` (
  `id_manager` int(11) NOT NULL,
  `id_angajat` int(11) NOT NULL,
  `id_departament` int(11) NOT NULL,
  `data_numire` date NOT NULL,
  `nr_subordonati` int(11) NOT NULL,
  `bonus_management` decimal(7,2) NOT NULL,
  `tip` enum('team_leader','project_manager','director') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `pozitii` (
  `id_pozitie` int(11) NOT NULL,
  `titlu` varchar(30) NOT NULL,
  `salariu_min` decimal(10,2) NOT NULL,
  `salariu_max` decimal(10,2) NOT NULL,
  `nivel` enum('junior', 'associate', 'intermediate', 'senior', 'consultant', 'principal') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `proiecte` (
  `id_proiect` int(11) NOT NULL,
  `nume` varchar(30) NOT NULL,
  `descriere` text NOT NULL,
  `data_start` date NOT NULL,
  `data_sfarsit` date NOT NULL,
  `status` enum('planificat','in desfasurare','finalizat') NOT NULL,
  `buget` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `utilizatori` (
  `id_utilizator` INT(11) NOT NULL AUTO_INCREMENT,
  `id_angajat` INT(11) NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `parola_hash` VARCHAR(255) NOT NULL,
  `rol` ENUM('hr_specialist', 'hr_manager', 'team_leader', 'project_manager', 'director', 'ceo') NOT NULL,
  `activ` TINYINT(1) NOT NULL DEFAULT 1,
  `ultima_autentificare` DATETIME DEFAULT NULL,
  `data_creare` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_utilizator`),
  UNIQUE KEY `uq_username` (`username`),
  UNIQUE KEY `uq_angajat` (`id_angajat`),
  KEY `idx_rol` (`rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;




-- Tabele pentru audit si notificari

CREATE TABLE IF NOT EXISTS `audit_log` (
  `id_log` INT(11) NOT NULL AUTO_INCREMENT,
  `tabel` VARCHAR(50) NOT NULL,
  `id_inregistrare` INT(11) NOT NULL,
  `actiune` ENUM('INSERT','UPDATE','DELETE','SOFT_DELETE') NOT NULL,
  `coloana` VARCHAR(50)  DEFAULT NULL,
  `valoare_veche` TEXT DEFAULT NULL,
  `valoare_noua` TEXT DEFAULT NULL,
  `utilizator` VARCHAR(100) DEFAULT NULL,
  `data_actiune` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_log`),
  KEY `idx_tabel_id` (`tabel`, `id_inregistrare`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `notificari` (
  `id_notificare` INT(11) NOT NULL AUTO_INCREMENT,
  `id_angajat` INT(11) NOT NULL,
  `tip` ENUM('evaluare','concediu','salariu','promovare','alerta') NOT NULL,
  `mesaj` VARCHAR(255) NOT NULL,
  `citita` TINYINT(1) NOT NULL DEFAULT 0,
  `data_creare` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_notificare`),
  KEY `idx_angajat` (`id_angajat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



ALTER TABLE `angajati`
  MODIFY COLUMN `telefon` varchar(17) NOT NULL;

ALTER TABLE `evaluari`
CHANGE COLUMN `scor tehnic` `scor_tehnic` int(11) NOT NULL;

ALTER TABLE `angajati`
ADD COLUMN `salariu_curent` decimal(10,2) NOT NULL AFTER `status`;

ALTER TABLE `pozitii`
CHANGE COLUMN `nivel` `nivel` enum('junior', 'associate', 'intermediate', 'senior', 'consultant', 'principal') NOT NULL;

ALTER TABLE `notificari`
  ADD INDEX `idx_notificari_necitite` (`id_angajat`, `citita`);


ALTER TABLE `angajati`
CHANGE COLUMN `email` `email` varchar(100) UNIQUE NOT NULL;

ALTER TABLE `angajati`
CHANGE COLUMN `cnp` `cnp` varchar(13) UNIQUE NOT NULL;

/*ALTER TABLE `alocari_proiecte`
CHANGE COLUMN `rol_proiect` `rol_proiect` enum() */

-- Adaugare constrangeri

ALTER TABLE `alocari_proiecte`
  ADD PRIMARY KEY (`id_alocare`),
  ADD KEY `fk_alocare_angajat` (`id_angajat`),
  ADD KEY `fk_alocare_proiect` (`id_proiect`);

ALTER TABLE `angajati`
  ADD PRIMARY KEY (`id_angajat`),
  ADD KEY `fk_angajat_departament` (`id_departament`),
  ADD KEY `fk_angajat_pozitie` (`id_pozitie`),
  ADD KEY `fk_angajat_manager` (`id_manager`);

ALTER TABLE `beneficii`
  ADD PRIMARY KEY (`id_beneficiu`);

ALTER TABLE `beneficii_angajati`
  ADD PRIMARY KEY (`id_angajat`,`id_beneficiu`),
  ADD KEY `fk_beneficii_beneficiu` (`id_beneficiu`);

ALTER TABLE `concedii`
  ADD PRIMARY KEY (`id_concediu`),
  ADD KEY `fk_concediu_angajat` (`id_angajat`),
  ADD KEY `fk_concediu_aprobator` (`id_aprobator`);

ALTER TABLE `departamente`
  ADD PRIMARY KEY (`id_departament`),
  ADD KEY `fk_departament_manager` (`id_manager`);

ALTER TABLE `evaluari`
  ADD PRIMARY KEY (`id_evaluare`),
  ADD KEY `fk_evaluare_angajat` (`id_angajat`),
  ADD KEY `fk_evaluare_evaluator` (`id_evaluator`);

ALTER TABLE `istoric_salarial`
  ADD PRIMARY KEY (`id_istoric`),
  ADD KEY `fk_istoric_angajat` (`id_angajat`);

ALTER TABLE `manageri`
  ADD PRIMARY KEY (`id_manager`),
  ADD KEY `fk_manager_angajat` (`id_angajat`),
  ADD KEY `fk_manager_departament` (`id_departament`);

ALTER TABLE `pozitii`
  ADD PRIMARY KEY (`id_pozitie`);

ALTER TABLE `proiecte`
  ADD PRIMARY KEY (`id_proiect`);

ALTER TABLE `alocari_proiecte`
  MODIFY `id_alocare` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `angajati`
  MODIFY `id_angajat` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `beneficii`
  MODIFY `id_beneficiu` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `concedii`
  MODIFY `id_concediu` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `departamente`
  MODIFY `id_departament` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `evaluari`
  MODIFY `id_evaluare` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `istoric_salarial`
  MODIFY `id_istoric` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `manageri`
  MODIFY `id_manager` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `pozitii`
  MODIFY `id_pozitie` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `proiecte`
  MODIFY `id_proiect` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `alocari_proiecte`
  ADD CONSTRAINT `fk_alocare_angajat` FOREIGN KEY (`id_angajat`) REFERENCES `angajati` (`id_angajat`),
  ADD CONSTRAINT `fk_alocare_proiect` FOREIGN KEY (`id_proiect`) REFERENCES `proiecte` (`id_proiect`);

ALTER TABLE `angajati`
  ADD CONSTRAINT `fk_angajat_departament` FOREIGN KEY (`id_departament`) REFERENCES `departamente` (`id_departament`),
  ADD CONSTRAINT `fk_angajat_manager` FOREIGN KEY (`id_manager`) REFERENCES `manageri` (`id_manager`),
  ADD CONSTRAINT `fk_angajat_pozitie` FOREIGN KEY (`id_pozitie`) REFERENCES `pozitii` (`id_pozitie`);

ALTER TABLE `beneficii_angajati`
  ADD CONSTRAINT `fk_beneficii_angajat` FOREIGN KEY (`id_angajat`) REFERENCES `angajati` (`id_angajat`),
  ADD CONSTRAINT `fk_beneficii_beneficiu` FOREIGN KEY (`id_beneficiu`) REFERENCES `beneficii` (`id_beneficiu`);

ALTER TABLE `concedii`
  ADD CONSTRAINT `fk_concediu_angajat` FOREIGN KEY (`id_angajat`) REFERENCES `angajati` (`id_angajat`),
  ADD CONSTRAINT `fk_concediu_aprobator` FOREIGN KEY (`id_aprobator`) REFERENCES `manageri` (`id_manager`);

ALTER TABLE `departamente`
  ADD CONSTRAINT `fk_departament_manager` FOREIGN KEY (`id_manager`) REFERENCES `manageri` (`id_manager`);

ALTER TABLE `evaluari`
  ADD CONSTRAINT `fk_evaluare_angajat` FOREIGN KEY (`id_angajat`) REFERENCES `angajati` (`id_angajat`),
  ADD CONSTRAINT `fk_evaluare_evaluator` FOREIGN KEY (`id_evaluator`) REFERENCES `angajati` (`id_angajat`);

ALTER TABLE `istoric_salarial`
  ADD CONSTRAINT `fk_istoric_angajat` FOREIGN KEY (`id_angajat`) REFERENCES `angajati` (`id_angajat`);

ALTER TABLE `manageri`
  ADD CONSTRAINT `fk_manager_angajat` FOREIGN KEY (`id_angajat`) REFERENCES `angajati` (`id_angajat`),
  ADD CONSTRAINT `fk_manager_departament` FOREIGN KEY (`id_departament`) REFERENCES `departamente` (`id_departament`);

ALTER TABLE `notificari`
  ADD CONSTRAINT `fk_notificare_angajat`
    FOREIGN KEY (`id_angajat`) REFERENCES `angajati` (`id_angajat`)
    ON DELETE CASCADE;

ALTER TABLE `utilizatori`
  ADD CONSTRAINT `fk_utilizator_angajat`
    FOREIGN KEY (`id_angajat`) REFERENCES `angajati` (`id_angajat`)
    ON DELETE RESTRICT;



-- Adaugare indexuri

ALTER TABLE `angajati`
  ADD INDEX `idx_angajat_departament` (`id_departament`),
  ADD INDEX `idx_angajat_pozitie` (`id_pozitie`),
  ADD INDEX `idx_angajat_manager` (`id_manager`),
  ADD INDEX `idx_angajat_status` (`status`);

ALTER TABLE `alocari_proiecte`
  ADD INDEX `idx_alocare_angajat` (`id_angajat`),
  ADD INDEX `idx_alocare_proiect` (`id_proiect`);

ALTER TABLE `evaluari`
  ADD INDEX `idx_evaluare_angajat` (`id_angajat`),
  ADD INDEX `idx_evaluare_evaluator` (`id_evaluator`);

ALTER TABLE `concedii`
  ADD INDEX `idx_concediu_angajat` (`id_angajat`),
  ADD INDEX `idx_concediu_status` (`status`);

ALTER TABLE `istoric_salarial`
  ADD INDEX `idx_istoric_angajat` (`id_angajat`),
  ADD INDEX `idx_istoric_data` (`data_modificare`);

ALTER TABLE `manageri`
  ADD INDEX `idx_manager_angajat` (`id_angajat`);



-- Creare triggere

    -- Modificarea salariului unui angajat
CREATE OR REPLACE TRIGGER `trg_modificare_salariu`
AFTER UPDATE ON `angajati`
FOR EACH ROW
BEGIN
    IF OLD.salariu_curent <> NEW.salariu_curent THEN
        INSERT INTO `istoric_salarial` (
            id_angajat,
            salariu_vechi,
            salariu_nou,
            data_modificare,
            motiv
        )
        VALUES (
            NEW.id_angajat,
            OLD.salariu_curent,
            NEW.salariu_curent,
            CURDATE(),
            CONCAT('Schimbare de la ', OLD.salariu_curent, ' la ', NEW.salariu_curent)
        );
    END IF;
END;

    -- Validarea datelor de concediu
CREATE TRIGGER `trg_validare_concediu`
BEFORE INSERT ON `concedii`
FOR EACH ROW
BEGIN
  IF NEW.data_sfarsit < NEW.data_start THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Eroare: data de sfarsit nu poate fi inainte de data de start';
  END IF;
END;

      -- Dezactivarea unui angajat
CREATE TRIGGER `trg_dezactivare_angajat`
AFTER UPDATE ON `angajati`
FOR EACH ROW
BEGIN
  IF OLD.status = 'activ' AND NEW.status = 'inactiv' THEN
    UPDATE `alocari_proiecte`
    SET `data_sfarsit` = CURDATE()
    WHERE `id_angajat` = NEW.id_angajat
      AND (`data_sfarsit` IS NULL OR `data_sfarsit` > CURDATE());
  END IF;
END;

      -- Validare scoruri evaluare
CREATE TRIGGER trg_validare_evaluare_scoruri BEFORE INSERT ON evaluari FOR EACH ROW
PRECEDES trg_calcul_scor_final
BEGIN
    IF NEW.scor_tehnic < 1 OR NEW.scor_tehnic > 10
       OR NEW.scor_comunicare < 1 OR NEW.scor_comunicare > 10
       OR NEW.scor_leadership < 1 OR NEW.scor_leadership > 10 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Eroare: scorurile trebuie sa fie intre 1 si 10';
    END IF;
END;

    -- Calcularea scorului final al unei evaluari
CREATE TRIGGER `trg_calcul_scor_final` BEFORE INSERT ON `evaluari` FOR EACH ROW
BEGIN
    SET NEW.scor_final = (NEW.scor_tehnic * 0.5 + NEW.scor_comunicare * 0.3 + NEW.scor_leadership * 0.2);
END;

    -- Verificare salariul in intervalul pozitiei
CREATE TRIGGER trg_validare_salariu_pozitie BEFORE INSERT ON angajati FOR EACH ROW
BEGIN
    DECLARE v_min DECIMAL(10,2);
    DECLARE v_max DECIMAL(10,2);
    SELECT salariu_min, salariu_max INTO v_min, v_max FROM pozitii WHERE id_pozitie = NEW.id_pozitie;
    IF NEW.salariu_curent < v_min OR NEW.salariu_curent > v_max THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Eroare: salariul nu este in intervalul permis pentru aceasta pozitie';
    END IF;
END;

    -- Validare salariu update
CREATE TRIGGER trg_validare_salariu_update BEFORE UPDATE ON angajati FOR EACH ROW
BEGIN
    DECLARE v_min DECIMAL(10,2);
    DECLARE v_max DECIMAL(10,2);
    SELECT salariu_min, salariu_max INTO v_min, v_max FROM pozitii WHERE id_pozitie = NEW.id_pozitie;
    IF NEW.salariu_curent < v_min OR NEW.salariu_curent > v_max THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Eroare: salariul nu este in intervalul permis pentru aceasta pozitie';
    END IF;
END;

    -- Validare date si la update pe concedii
CREATE TRIGGER trg_validare_concediu_update BEFORE UPDATE ON concedii FOR EACH ROW
BEGIN
    IF NEW.data_sfarsit < NEW.data_start THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Eroare: data de sfarsit nu poate fi inainte de data de start';
    END IF;
END;

    -- Actualizare numar subordonati la adaugare angajat
CREATE TRIGGER trg_update_nr_subordonati_insert AFTER INSERT ON angajati FOR EACH ROW
BEGIN
    IF NEW.id_manager IS NOT NULL THEN
        UPDATE manageri SET nr_subordonati = nr_subordonati + 1 WHERE id_manager = NEW.id_manager;
    END IF;
END;

      -- Actualizare numar subordonati la stergere angajat
CREATE TRIGGER trg_update_nr_subordonati_delete AFTER DELETE ON angajati FOR EACH ROW
BEGIN
    IF OLD.id_manager IS NOT NULL THEN
        UPDATE manageri SET nr_subordonati = nr_subordonati - 1 WHERE id_manager = OLD.id_manager;
    END IF;
END;

        -- Actualizare numar subordonati la modificare angajat
CREATE TRIGGER trg_update_nr_subordonati_update AFTER UPDATE ON angajati FOR EACH ROW
BEGIN
    IF OLD.id_manager IS NOT NULL AND (NEW.id_manager IS NULL OR OLD.id_manager <> NEW.id_manager) THEN
        UPDATE manageri SET nr_subordonati = nr_subordonati - 1 WHERE id_manager = OLD.id_manager;
    END IF;
    IF NEW.id_manager IS NOT NULL AND (OLD.id_manager IS NULL OR OLD.id_manager <> NEW.id_manager) THEN
        UPDATE manageri SET nr_subordonati = nr_subordonati + 1 WHERE id_manager = NEW.id_manager;
    END IF;
END;

      -- Validare date alocare proiect
CREATE TRIGGER trg_validare_alocare_proiect BEFORE INSERT ON alocari_proiecte FOR EACH ROW
BEGIN
    IF NEW.data_sfarsit IS NOT NULL AND NEW.data_sfarsit < NEW.data_start THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Eroare: data sfarsit alocare nu poate fi inainte de data start';
    END IF;
END;

      -- Prevenire stergere angajat
CREATE TRIGGER trg_prevent_delete_angajat BEFORE DELETE ON angajati FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Eroare: angajatii nu pot fi stersi. Setati status = inactiv';
END;

      -- Trigger pentru audit modificari angajat
CREATE TRIGGER `trg_audit_modificari_angajat`
AFTER UPDATE ON `angajati`
FOR EACH ROW
BEGIN
    IF NOT (OLD.cnp <=> NEW.cnp) THEN
        INSERT INTO audit_log(tabel, id_inregistrare, actiune, coloana, valoare_veche, valoare_noua, utilizator)
        VALUES ('angajati', NEW.id_angajat, 'UPDATE', 'cnp', OLD.cnp, NEW.cnp, CURRENT_USER());
    END IF;
    IF NOT (OLD.email <=> NEW.email) THEN
        INSERT INTO audit_log(tabel, id_inregistrare, actiune, coloana, valoare_veche, valoare_noua, utilizator)
        VALUES ('angajati', NEW.id_angajat, 'UPDATE', 'email', OLD.email, NEW.email, CURRENT_USER());
    END IF;
    IF NOT (OLD.telefon <=> NEW.telefon) THEN
        INSERT INTO audit_log(tabel, id_inregistrare, actiune, coloana, valoare_veche, valoare_noua, utilizator)
        VALUES ('angajati', NEW.id_angajat, 'UPDATE', 'telefon', OLD.telefon, NEW.telefon, CURRENT_USER());
    END IF;
    IF NOT (OLD.id_pozitie <=> NEW.id_pozitie) THEN
        INSERT INTO audit_log(tabel, id_inregistrare, actiune, coloana, valoare_veche, valoare_noua, utilizator)
        VALUES ('angajati', NEW.id_angajat, 'UPDATE', 'id_pozitie', OLD.id_pozitie, NEW.id_pozitie, CURRENT_USER());
    END IF;
    IF NOT (OLD.id_departament <=> NEW.id_departament) THEN
        INSERT INTO audit_log(tabel, id_inregistrare, actiune, coloana, valoare_veche, valoare_noua, utilizator)
        VALUES ('angajati', NEW.id_angajat, 'UPDATE', 'id_departament', OLD.id_departament, NEW.id_departament, CURRENT_USER());
    END IF;
END;

      -- Trigger pentru audit stergere logica angajat
CREATE TRIGGER `trg_audit_stergere_logica`
AFTER UPDATE ON `angajati`
FOR EACH ROW
BEGIN
    IF OLD.status = 'activ' AND NEW.status = 'inactiv' THEN
        INSERT INTO audit_log(tabel, id_inregistrare, actiune, valoare_veche, utilizator)
        VALUES (
            'angajati',
            NEW.id_angajat,
            'SOFT_DELETE',
            CONCAT_WS('|',
                OLD.nume, OLD.prenume, OLD.cnp, OLD.email, OLD.telefon,
                OLD.data_angajare, OLD.id_departament, OLD.id_pozitie,
                OLD.id_manager, OLD.salariu_curent
            ),
            CURRENT_USER()
        );
    END IF;
END;

      -- Validare data angajare: in prezent + varsta minima 16 ani
CREATE TRIGGER `trg_validare_data_angajare`
BEFORE INSERT ON `angajati`
FOR EACH ROW
BEGIN
    DECLARE v_an   INT;
    DECLARE v_luna INT;
    DECLARE v_zi   INT;
    DECLARE v_sec  INT;
    DECLARE v_data_nastere DATE;
    IF NEW.data_angajare > CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Eroare: data angajarii nu poate fi in viitor';
    END IF;
    IF CHAR_LENGTH(NEW.cnp) = 13 THEN
        SET v_sec  = CAST(SUBSTRING(NEW.cnp, 1, 1) AS UNSIGNED);
        SET v_an   = CAST(SUBSTRING(NEW.cnp, 2, 2) AS UNSIGNED);
        SET v_luna = CAST(SUBSTRING(NEW.cnp, 4, 2) AS UNSIGNED);
        SET v_zi   = CAST(SUBSTRING(NEW.cnp, 6, 2) AS UNSIGNED);
        IF v_sec IN (1,2) THEN SET v_an = 1900 + v_an;
        ELSEIF v_sec IN (3,4) THEN SET v_an = 1800 + v_an;
        ELSEIF v_sec IN (5,6) THEN SET v_an = 2000 + v_an;
        ELSE SET v_an = 2000 + v_an; END IF;
        SET v_data_nastere = STR_TO_DATE(CONCAT(v_an,'-',v_luna,'-',v_zi),'%Y-%m-%d');
        IF v_data_nastere IS NULL THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Eroare: CNP invalid (data nastere)';
        END IF;
        IF TIMESTAMPDIFF(YEAR, v_data_nastere, NEW.data_angajare) < 16 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Eroare: angajatul are sub 16 ani la data angajarii';
        END IF;
    END IF;
END;

      -- Verificare suprapunere concedii
CREATE TRIGGER `trg_overlap_concedii`
BEFORE INSERT ON `concedii`
FOR EACH ROW
BEGIN
    DECLARE v_count INT;
    SELECT COUNT(*) INTO v_count
    FROM concedii
    WHERE id_angajat = NEW.id_angajat
      AND status IN ('aprobat','in asteptare')
      AND NEW.data_start <= data_sfarsit
      AND NEW.data_sfarsit >= data_start;
    IF v_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Eroare: exista deja un concediu suprapus pentru acest angajat';
    END IF;
END;

      -- Notificare evaluare scazuta (scor final < 5)
CREATE TRIGGER `trg_notificare_evaluare_scazuta`
AFTER INSERT ON `evaluari`
FOR EACH ROW
BEGIN
    IF NEW.scor_final < 5 THEN
        INSERT INTO notificari(id_angajat, tip, mesaj)
        VALUES (
            NEW.id_angajat,
            'evaluare',
            CONCAT('Evaluare scazuta: scor final ', NEW.scor_final, ' la data ', NEW.data_evaluare)
        );
    END IF;
END;

      -- Rezolvare problema nr_subordonati in manageri
ALTER TABLE `manageri`
  DROP COLUMN `nr_subordonati`;
DROP TRIGGER `trg_update_nr_subordonati_insert`;
DROP TRIGGER `trg_update_nr_subordonati_delete`;
DROP TRIGGER `trg_update_nr_subordonati_update`;
      -- View care calculeaza dinamic
CREATE VIEW `view_subordonati_manageri` AS
SELECT
    m.id_manager,
    a_manager.nume AS nume_manager,
    a_manager.prenume AS prenume_manager,
    COUNT(a.id_angajat) AS nr_subordonati
FROM manageri m
JOIN angajati a_manager ON a_manager.id_angajat = m.id_angajat
LEFT JOIN angajati a ON a.id_manager = m.id_manager
    AND a.status = 'activ'
GROUP BY m.id_manager, a_manager.nume, a_manager.prenume;

SELECT * FROM `view_subordonati_manageri`;


      -- Self-join angajati si manageri
SELECT
    a.id_angajat,
    a.nume                          AS nume_angajat,
    a.prenume                       AS prenume_angajat,
    p.titlu                         AS pozitie_angajat,
    d.nume                          AS departament,
    a.salariu_curent,
    a.status,
    m_ang.nume                      AS nume_manager,
    m_ang.prenume                   AS prenume_manager,
    p_mgr.titlu                     AS pozitie_manager,
    mgr.tip                         AS tip_manager
FROM angajati a
JOIN manageri mgr       ON a.id_manager       = mgr.id_manager
JOIN angajati m_ang     ON mgr.id_angajat     = m_ang.id_angajat
JOIN pozitii p          ON a.id_pozitie       = p.id_pozitie
JOIN pozitii p_mgr      ON m_ang.id_pozitie   = p_mgr.id_pozitie
JOIN departamente d     ON a.id_departament   = d.id_departament
WHERE a.status = 'activ'
ORDER BY d.nume, mgr.tip, a.nume
LIMIT 20;

      -- Subordonatii fiecarui manager
SELECT
    m_ang.nume                          AS nume_manager,
    m_ang.prenume                       AS prenume_manager,
    mgr.tip                             AS tip_manager,
    d.nume                              AS departament,
    COUNT(a.id_angajat)                 AS nr_subordonati,
    ROUND(AVG(a.salariu_curent), 2)     AS salariu_mediu_echipa
FROM manageri mgr
JOIN angajati m_ang     ON mgr.id_angajat     = m_ang.id_angajat
JOIN angajati a         ON a.id_manager       = mgr.id_manager
JOIN departamente d     ON mgr.id_departament = d.id_departament
WHERE a.status = 'activ'
GROUP BY mgr.id_manager, m_ang.nume, m_ang.prenume, mgr.tip, d.nume
ORDER BY nr_subordonati DESC
LIMIT 10;



      -- CTE Recursive
      WITH RECURSIVE ierarhie AS (
    -- CAZUL DE BAZA: managerii de tip 'director' (top management)
    SELECT
        a.id_angajat,
        a.nume,
        a.prenume,
        p.titlu                             AS pozitie,
        d.nume                              AS departament,
        a.salariu_curent,
        mgr.tip                             AS tip_manager,
        0                                   AS nivel,
        CONCAT(a.prenume, ' ', a.nume)      AS cale
    FROM angajati a
    JOIN manageri mgr       ON a.id_angajat       = mgr.id_angajat
    JOIN pozitii p          ON a.id_pozitie        = p.id_pozitie
    JOIN departamente d     ON a.id_departament    = d.id_departament
    WHERE mgr.tip = 'director'
    UNION ALL
    -- PASUL RECURSIV: subordonatii fiecarui angajat din iteratia anterioara
    SELECT
        a.id_angajat,
        a.nume,
        a.prenume,
        p.titlu                                             AS pozitie,
        d.nume                                              AS departament,
        a.salariu_curent,
        NULL                                                AS tip_manager,
        i.nivel + 1                                         AS nivel,
        CONCAT(i.cale, ' → ', a.prenume, ' ', a.nume)      AS cale
    FROM angajati a
    JOIN manageri mgr       ON a.id_manager        = mgr.id_manager
    JOIN angajati mgr_ang   ON mgr.id_angajat       = mgr_ang.id_angajat
    JOIN pozitii p          ON a.id_pozitie         = p.id_pozitie
    JOIN departamente d     ON a.id_departament     = d.id_departament
    JOIN ierarhie i         ON mgr_ang.id_angajat   = i.id_angajat
    WHERE a.status = 'activ'
      AND i.nivel < 3  -- limiteaza adancimea la 3 niveluri, previne bucle infinite
)
SELECT
    nivel,
    REPEAT('-> ', nivel) AS indentare,  -- indentare vizuala
    prenume,
    nume,
    pozitie,
    departament,
    salariu_curent,
    cale
FROM ierarhie
ORDER BY cale;



      -- Proceduri stocate pentru calcul salarial

      -- Calcul salariu net
CREATE PROCEDURE `proc_calcul_salariu_net`(
    IN p_id_angajat INT
)
BEGIN
    DECLARE v_salariu_brut      DECIMAL(10,2);
    DECLARE v_total_beneficii   DECIMAL(10,2);
    DECLARE v_impozit           DECIMAL(10,2);
    DECLARE v_cas               DECIMAL(10,2);
    DECLARE v_cass              DECIMAL(10,2);
    DECLARE v_salariu_net       DECIMAL(10,2);
    DECLARE v_nume              VARCHAR(100);
    DECLARE v_prenume           VARCHAR(30);
    SELECT
        a.salariu_curent,
        a.nume,
        a.prenume
    INTO
        v_salariu_brut,
        v_nume,
        v_prenume
    FROM angajati a
    WHERE a.id_angajat = p_id_angajat;
    SELECT COALESCE(SUM(b.valoare), 0)
    INTO v_total_beneficii
    FROM beneficii_angajati ba
    JOIN beneficii b ON ba.id_beneficiu = b.id_beneficiu
    WHERE ba.id_angajat = p_id_angajat;
    SET v_cas   = ROUND(v_salariu_brut * 0.25, 2);
    SET v_cass  = ROUND(v_salariu_brut * 0.10, 2);
    SET v_impozit = ROUND((v_salariu_brut - v_cas - v_cass) * 0.10, 2);
    SET v_salariu_net = v_salariu_brut - v_cas - v_cass - v_impozit + v_total_beneficii;
    SELECT
        p_id_angajat                        AS id_angajat,
        v_prenume                           AS prenume,
        v_nume                              AS nume,
        v_salariu_brut                      AS salariu_brut,
        v_cas                               AS retinere_cas,
        v_cass                              AS retinere_cass,
        v_impozit                           AS retinere_impozit,
        v_total_beneficii                   AS total_beneficii,
        v_salariu_net                       AS salariu_net;
END;

CALL proc_calcul_salariu_net(1);
CALL proc_calcul_salariu_net(50);

      -- Marire salariu
CREATE PROCEDURE `proc_marire_salariu`(
    IN p_id_angajat     INT,
    IN p_procent        DECIMAL(5,2),
    IN p_motiv          VARCHAR(200)
)
BEGIN
    DECLARE v_salariu_vechi     DECIMAL(10,2);
    DECLARE v_salariu_nou       DECIMAL(10,2);
    DECLARE v_nivel_pozitie     VARCHAR(20);
    DECLARE v_salariu_max       DECIMAL(10,2);
    SELECT
        a.salariu_curent,
        p.nivel,
        p.salariu_max
    INTO
        v_salariu_vechi,
        v_nivel_pozitie,
        v_salariu_max
    FROM angajati a
    JOIN pozitii p ON a.id_pozitie = p.id_pozitie
    WHERE a.id_angajat = p_id_angajat;
    SET v_salariu_nou = ROUND(v_salariu_vechi * (1 + p_procent / 100), 2);
    IF v_salariu_nou > v_salariu_max THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Eroare: salariul nou depaseste maximul permis pentru aceasta pozitie';
    END IF;
    UPDATE angajati
    SET salariu_curent = v_salariu_nou
    WHERE id_angajat = p_id_angajat;
    INSERT INTO notificari (id_angajat, tip, mesaj)
    VALUES (
        p_id_angajat,
        'salariu',
        CONCAT('Felicitari! Salariul tau a fost majorat cu ', p_procent, '%. ',
               'Noul salariu brut este ', v_salariu_nou, ' RON.')
    );
    SELECT
        p_id_angajat        AS id_angajat,
        v_salariu_vechi     AS salariu_vechi,
        v_salariu_nou       AS salariu_nou,
        p_procent           AS procent_marire,
        p_motiv             AS motiv,
        'Succes'            AS status;
END;

CALL proc_marire_salariu(1, 10.00, 'Evaluare anuala excelenta'); -- marire de 10% pentru angajatul cu id 1
SELECT * FROM istoric_salarial WHERE id_angajat = 1; -- verifica ca s-a inregistrat in istoric
SELECT * FROM notificari WHERE id_angajat = 1; -- verifica ca a aparut notificarea

      -- Raport salarii pe departament
CREATE PROCEDURE `proc_raport_salarii_departament`(
    IN p_id_departament INT
)
BEGIN
    SELECT
        d.nume                              AS departament,
        d.locatie,
        COUNT(a.id_angajat)                 AS nr_angajati,
        MIN(a.salariu_curent)               AS salariu_minim,
        MAX(a.salariu_curent)               AS salariu_maxim,
        ROUND(AVG(a.salariu_curent), 2)     AS salariu_mediu,
        SUM(a.salariu_curent)               AS masa_salariala_totala,
        p.nivel                             AS nivel_dominant

    FROM angajati a
    JOIN departamente d ON a.id_departament = d.id_departament
    JOIN pozitii p      ON a.id_pozitie     = p.id_pozitie

    WHERE a.status = 'activ'
      AND (p_id_departament IS NULL OR d.id_departament = p_id_departament)

    GROUP BY d.id_departament, d.nume, d.locatie, p.nivel
    ORDER BY masa_salariala_totala DESC;
END;

CALL proc_raport_salarii_departament(NULL);
CALL proc_raport_salarii_departament(1);

SHOW PROCEDURE STATUS WHERE Db = 'my_database';

CREATE TABLE IF NOT EXISTS `predictii_churn` (
    `id_predictie`      INT(11)         NOT NULL AUTO_INCREMENT,
    `id_angajat`        INT(11)         NOT NULL,
    `probabilitate`     DECIMAL(5,4)    NOT NULL,
    `nivel_risc`        ENUM('Mic','Mediu','Mare') NOT NULL,
    `data_predictie`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_predictie`),
    UNIQUE KEY `uq_angajat` (`id_angajat`),
    KEY `idx_nivel_risc` (`nivel_risc`),
    FOREIGN KEY (`id_angajat`) REFERENCES `angajati`(`id_angajat`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `predictii_churn` RENAME TO `predictii_churn_rf`;

SELECT * FROM `predictii_churn_rf`;
SELECT * FROM `predictii_churn_lr`;
SELECT * FROM `predictii_churn_xgb`;