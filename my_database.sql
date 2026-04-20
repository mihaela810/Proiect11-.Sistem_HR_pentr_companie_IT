-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 20, 2026 at 01:58 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `my_database`
--

-- --------------------------------------------------------

--
-- Table structure for table `alocari_proiecte`
--

CREATE TABLE `alocari_proiecte` (
  `id_alocare` int(11) NOT NULL,
  `id_angajat` int(11) NOT NULL,
  `id_proiect` int(11) NOT NULL,
  `rol_proiect` varchar(30) DEFAULT NULL,
  `ore_alocate` int(11) DEFAULT NULL,
  `data_start` date DEFAULT NULL,
  `data_sfarsit` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `alocari_proiecte`
--
DELIMITER $$
CREATE TRIGGER `trg_validare_alocare_proiect` BEFORE INSERT ON `alocari_proiecte` FOR EACH ROW BEGIN
    IF NEW.data_sfarsit IS NOT NULL AND NEW.data_sfarsit < NEW.data_start THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Eroare: data sfarsit alocare nu poate fi inainte de data start';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `angajati`
--

CREATE TABLE `angajati` (
  `id_angajat` int(11) NOT NULL,
  `nume` varchar(100) DEFAULT NULL,
  `prenume` varchar(30) NOT NULL,
  `cnp` varchar(13) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefon` varchar(17) NOT NULL,
  `data_angajare` date NOT NULL,
  `id_departament` int(11) NOT NULL,
  `id_pozitie` int(11) NOT NULL,
  `id_manager` int(11) DEFAULT NULL,
  `status` enum('activ','inactiv') NOT NULL DEFAULT 'activ',
  `salariu_curent` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `angajati`
--
DELIMITER $$
CREATE TRIGGER `trg_audit_modificari_angajat` AFTER UPDATE ON `angajati` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_audit_stergere_logica` AFTER UPDATE ON `angajati` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_modificare_salariu` AFTER UPDATE ON `angajati` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_validare_data_angajare` BEFORE INSERT ON `angajati` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_validare_salariu_pozitie` BEFORE INSERT ON `angajati` FOR EACH ROW BEGIN
    DECLARE v_min DECIMAL(10,2);
    DECLARE v_max DECIMAL(10,2);
    SELECT salariu_min, salariu_max INTO v_min, v_max FROM pozitii WHERE id_pozitie = NEW.id_pozitie;
    IF NEW.salariu_curent < v_min OR NEW.salariu_curent > v_max THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Eroare: salariul nu este in intervalul permis pentru aceasta pozitie';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_validare_salariu_update` BEFORE UPDATE ON `angajati` FOR EACH ROW BEGIN
    DECLARE v_min DECIMAL(10,2);
    DECLARE v_max DECIMAL(10,2);
    SELECT salariu_min, salariu_max INTO v_min, v_max FROM pozitii WHERE id_pozitie = NEW.id_pozitie;
    IF NEW.salariu_curent < v_min OR NEW.salariu_curent > v_max THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Eroare: salariul nu este in intervalul permis pentru aceasta pozitie';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `audit_log`
--

CREATE TABLE `audit_log` (
  `id_log` int(11) NOT NULL,
  `tabel` varchar(50) NOT NULL,
  `id_inregistrare` int(11) NOT NULL,
  `actiune` enum('INSERT','UPDATE','DELETE','SOFT_DELETE') NOT NULL,
  `coloana` varchar(50) DEFAULT NULL,
  `valoare_veche` text DEFAULT NULL,
  `valoare_noua` text DEFAULT NULL,
  `utilizator` varchar(100) DEFAULT NULL,
  `data_actiune` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `beneficii`
--

CREATE TABLE `beneficii` (
  `id_beneficiu` int(11) NOT NULL,
  `nume` varchar(30) NOT NULL,
  `descriere` text NOT NULL,
  `valoare` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `beneficii_angajati`
--

CREATE TABLE `beneficii_angajati` (
  `id_angajat` int(11) NOT NULL,
  `id_beneficiu` int(11) NOT NULL,
  `data_acordare` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `concedii`
--

CREATE TABLE `concedii` (
  `id_concediu` int(11) NOT NULL,
  `id_angajat` int(11) NOT NULL,
  `id_aprobator` int(11) NOT NULL,
  `tip` enum('odihna','boala','concediu fara plata') NOT NULL,
  `data_start` date NOT NULL,
  `data_sfarsit` date NOT NULL,
  `status` enum('aprobat','respins','in asteptare') NOT NULL DEFAULT 'in asteptare'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `concedii`
--
DELIMITER $$
CREATE TRIGGER `trg_overlap_concedii` BEFORE INSERT ON `concedii` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_validare_concediu` BEFORE INSERT ON `concedii` FOR EACH ROW BEGIN
  IF NEW.data_sfarsit < NEW.data_start THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Eroare: data de sfarsit nu poate fi inainte de data de start';
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_validare_concediu_update` BEFORE UPDATE ON `concedii` FOR EACH ROW BEGIN
    IF NEW.data_sfarsit < NEW.data_start THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Eroare: data de sfarsit nu poate fi inainte de data de start';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `departamente`
--

CREATE TABLE `departamente` (
  `id_departament` int(11) NOT NULL,
  `nume` varchar(30) NOT NULL,
  `locatie` varchar(60) NOT NULL,
  `id_manager` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `evaluari`
--

CREATE TABLE `evaluari` (
  `id_evaluare` int(11) NOT NULL,
  `id_angajat` int(11) NOT NULL,
  `id_evaluator` int(11) NOT NULL,
  `data_evaluare` date NOT NULL,
  `scor_tehnic` int(11) NOT NULL,
  `scor_comunicare` int(11) NOT NULL,
  `scor_leadership` int(11) NOT NULL,
  `scor_final` decimal(5,2) NOT NULL,
  `feedback` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `evaluari`
--
DELIMITER $$
CREATE TRIGGER `trg_calcul_scor_final` BEFORE INSERT ON `evaluari` FOR EACH ROW BEGIN
    SET NEW.scor_final = (NEW.scor_tehnic * 0.5 + NEW.scor_comunicare * 0.3 + NEW.scor_leadership * 0.2);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_notificare_evaluare_scazuta` AFTER INSERT ON `evaluari` FOR EACH ROW BEGIN
    IF NEW.scor_final < 5 THEN
        INSERT INTO notificari(id_angajat, tip, mesaj)
        VALUES (
            NEW.id_angajat,
            'evaluare',
            CONCAT('Evaluare scazuta: scor final ', NEW.scor_final, ' la data ', NEW.data_evaluare)
        );
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_validare_evaluare_scoruri` BEFORE INSERT ON `evaluari` FOR EACH ROW BEGIN
    IF NEW.scor_tehnic < 1 OR NEW.scor_tehnic > 10
       OR NEW.scor_comunicare < 1 OR NEW.scor_comunicare > 10
       OR NEW.scor_leadership < 1 OR NEW.scor_leadership > 10 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Eroare: scorurile trebuie sa fie intre 1 si 10';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `istoric_salarial`
--

CREATE TABLE `istoric_salarial` (
  `id_istoric` int(11) NOT NULL,
  `id_angajat` int(11) NOT NULL,
  `salariu_vechi` decimal(7,2) NOT NULL,
  `salariu_nou` decimal(7,2) NOT NULL,
  `data_modificare` date NOT NULL,
  `motiv` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `manageri`
--

CREATE TABLE `manageri` (
  `id_manager` int(11) NOT NULL,
  `id_angajat` int(11) NOT NULL,
  `id_departament` int(11) NOT NULL,
  `data_numire` date NOT NULL,
  `bonus_management` decimal(7,2) NOT NULL,
  `tip` enum('team_leader','project_manager','director') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notificari`
--

CREATE TABLE `notificari` (
  `id_notificare` int(11) NOT NULL,
  `id_angajat` int(11) NOT NULL,
  `tip` enum('evaluare','concediu','salariu','promovare','alerta') NOT NULL,
  `mesaj` varchar(255) NOT NULL,
  `citita` tinyint(1) NOT NULL DEFAULT 0,
  `data_creare` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pozitii`
--

CREATE TABLE `pozitii` (
  `id_pozitie` int(11) NOT NULL,
  `titlu` varchar(30) NOT NULL,
  `salariu_min` decimal(10,2) NOT NULL,
  `salariu_max` decimal(10,2) NOT NULL,
  `nivel` enum('junior','associate','intermediate','senior','consultant','principal') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proiecte`
--

CREATE TABLE `proiecte` (
  `id_proiect` int(11) NOT NULL,
  `nume` varchar(30) NOT NULL,
  `descriere` text NOT NULL,
  `data_start` date NOT NULL,
  `data_sfarsit` date NOT NULL,
  `status` enum('planificat','in desfasurare','finalizat') NOT NULL,
  `buget` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `utilizatori`
--

CREATE TABLE `utilizatori` (
  `id_utilizator` int(11) NOT NULL,
  `id_angajat` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `parola_hash` varchar(255) NOT NULL,
  `rol` enum('hr_specialist','hr_manager','team_leader','project_manager','director','ceo') NOT NULL,
  `activ` tinyint(1) NOT NULL DEFAULT 1,
  `ultima_autentificare` datetime DEFAULT NULL,
  `data_creare` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `view_subordonati_manageri`
-- (See below for the actual view)
--
CREATE TABLE `view_subordonati_manageri` (
`id_manager` int(11)
,`nume_manager` varchar(100)
,`prenume_manager` varchar(30)
,`nr_subordonati` bigint(21)
);

-- --------------------------------------------------------

--
-- Structure for view `view_subordonati_manageri`
--
DROP TABLE IF EXISTS `view_subordonati_manageri`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_subordonati_manageri`  AS SELECT `m`.`id_manager` AS `id_manager`, `a_manager`.`nume` AS `nume_manager`, `a_manager`.`prenume` AS `prenume_manager`, count(`a`.`id_angajat`) AS `nr_subordonati` FROM ((`manageri` `m` join `angajati` `a_manager` on(`a_manager`.`id_angajat` = `m`.`id_angajat`)) left join `angajati` `a` on(`a`.`id_manager` = `m`.`id_manager` and `a`.`status` = 'activ')) GROUP BY `m`.`id_manager`, `a_manager`.`nume`, `a_manager`.`prenume` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `alocari_proiecte`
--
ALTER TABLE `alocari_proiecte`
  ADD PRIMARY KEY (`id_alocare`),
  ADD KEY `idx_alocare_angajat` (`id_angajat`),
  ADD KEY `idx_alocare_proiect` (`id_proiect`);

--
-- Indexes for table `angajati`
--
ALTER TABLE `angajati`
  ADD PRIMARY KEY (`id_angajat`),
  ADD KEY `idx_angajat_departament` (`id_departament`),
  ADD KEY `idx_angajat_pozitie` (`id_pozitie`),
  ADD KEY `idx_angajat_manager` (`id_manager`),
  ADD KEY `idx_angajat_status` (`status`);

--
-- Indexes for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`id_log`),
  ADD KEY `idx_tabel_id` (`tabel`,`id_inregistrare`);

--
-- Indexes for table `beneficii`
--
ALTER TABLE `beneficii`
  ADD PRIMARY KEY (`id_beneficiu`);

--
-- Indexes for table `beneficii_angajati`
--
ALTER TABLE `beneficii_angajati`
  ADD PRIMARY KEY (`id_angajat`,`id_beneficiu`),
  ADD KEY `fk_beneficii_beneficiu` (`id_beneficiu`);

--
-- Indexes for table `concedii`
--
ALTER TABLE `concedii`
  ADD PRIMARY KEY (`id_concediu`),
  ADD KEY `fk_concediu_aprobator` (`id_aprobator`),
  ADD KEY `idx_concediu_angajat` (`id_angajat`),
  ADD KEY `idx_concediu_status` (`status`);

--
-- Indexes for table `departamente`
--
ALTER TABLE `departamente`
  ADD PRIMARY KEY (`id_departament`),
  ADD KEY `fk_departament_manager` (`id_manager`);

--
-- Indexes for table `evaluari`
--
ALTER TABLE `evaluari`
  ADD PRIMARY KEY (`id_evaluare`),
  ADD KEY `idx_evaluare_angajat` (`id_angajat`),
  ADD KEY `idx_evaluare_evaluator` (`id_evaluator`);

--
-- Indexes for table `istoric_salarial`
--
ALTER TABLE `istoric_salarial`
  ADD PRIMARY KEY (`id_istoric`),
  ADD KEY `idx_istoric_angajat` (`id_angajat`),
  ADD KEY `idx_istoric_data` (`data_modificare`);

--
-- Indexes for table `manageri`
--
ALTER TABLE `manageri`
  ADD PRIMARY KEY (`id_manager`),
  ADD KEY `fk_manager_departament` (`id_departament`),
  ADD KEY `idx_manager_angajat` (`id_angajat`);

--
-- Indexes for table `notificari`
--
ALTER TABLE `notificari`
  ADD PRIMARY KEY (`id_notificare`),
  ADD KEY `idx_angajat` (`id_angajat`),
  ADD KEY `idx_notificari_necitite` (`id_angajat`,`citita`);

--
-- Indexes for table `pozitii`
--
ALTER TABLE `pozitii`
  ADD PRIMARY KEY (`id_pozitie`);

--
-- Indexes for table `proiecte`
--
ALTER TABLE `proiecte`
  ADD PRIMARY KEY (`id_proiect`);

--
-- Indexes for table `utilizatori`
--
ALTER TABLE `utilizatori`
  ADD PRIMARY KEY (`id_utilizator`),
  ADD UNIQUE KEY `uq_username` (`username`),
  ADD UNIQUE KEY `uq_angajat` (`id_angajat`),
  ADD KEY `idx_rol` (`rol`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `alocari_proiecte`
--
ALTER TABLE `alocari_proiecte`
  MODIFY `id_alocare` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `angajati`
--
ALTER TABLE `angajati`
  MODIFY `id_angajat` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `id_log` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `beneficii`
--
ALTER TABLE `beneficii`
  MODIFY `id_beneficiu` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `concedii`
--
ALTER TABLE `concedii`
  MODIFY `id_concediu` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departamente`
--
ALTER TABLE `departamente`
  MODIFY `id_departament` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evaluari`
--
ALTER TABLE `evaluari`
  MODIFY `id_evaluare` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `istoric_salarial`
--
ALTER TABLE `istoric_salarial`
  MODIFY `id_istoric` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `manageri`
--
ALTER TABLE `manageri`
  MODIFY `id_manager` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notificari`
--
ALTER TABLE `notificari`
  MODIFY `id_notificare` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pozitii`
--
ALTER TABLE `pozitii`
  MODIFY `id_pozitie` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `proiecte`
--
ALTER TABLE `proiecte`
  MODIFY `id_proiect` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `utilizatori`
--
ALTER TABLE `utilizatori`
  MODIFY `id_utilizator` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `alocari_proiecte`
--
ALTER TABLE `alocari_proiecte`
  ADD CONSTRAINT `fk_alocare_angajat` FOREIGN KEY (`id_angajat`) REFERENCES `angajati` (`id_angajat`),
  ADD CONSTRAINT `fk_alocare_proiect` FOREIGN KEY (`id_proiect`) REFERENCES `proiecte` (`id_proiect`);

--
-- Constraints for table `angajati`
--
ALTER TABLE `angajati`
  ADD CONSTRAINT `fk_angajat_departament` FOREIGN KEY (`id_departament`) REFERENCES `departamente` (`id_departament`),
  ADD CONSTRAINT `fk_angajat_manager` FOREIGN KEY (`id_manager`) REFERENCES `manageri` (`id_manager`),
  ADD CONSTRAINT `fk_angajat_pozitie` FOREIGN KEY (`id_pozitie`) REFERENCES `pozitii` (`id_pozitie`);

--
-- Constraints for table `beneficii_angajati`
--
ALTER TABLE `beneficii_angajati`
  ADD CONSTRAINT `fk_beneficii_angajat` FOREIGN KEY (`id_angajat`) REFERENCES `angajati` (`id_angajat`),
  ADD CONSTRAINT `fk_beneficii_beneficiu` FOREIGN KEY (`id_beneficiu`) REFERENCES `beneficii` (`id_beneficiu`);

--
-- Constraints for table `concedii`
--
ALTER TABLE `concedii`
  ADD CONSTRAINT `fk_concediu_angajat` FOREIGN KEY (`id_angajat`) REFERENCES `angajati` (`id_angajat`),
  ADD CONSTRAINT `fk_concediu_aprobator` FOREIGN KEY (`id_aprobator`) REFERENCES `manageri` (`id_manager`);

--
-- Constraints for table `departamente`
--
ALTER TABLE `departamente`
  ADD CONSTRAINT `fk_departament_manager` FOREIGN KEY (`id_manager`) REFERENCES `manageri` (`id_manager`);

--
-- Constraints for table `evaluari`
--
ALTER TABLE `evaluari`
  ADD CONSTRAINT `fk_evaluare_angajat` FOREIGN KEY (`id_angajat`) REFERENCES `angajati` (`id_angajat`),
  ADD CONSTRAINT `fk_evaluare_evaluator` FOREIGN KEY (`id_evaluator`) REFERENCES `angajati` (`id_angajat`);

--
-- Constraints for table `istoric_salarial`
--
ALTER TABLE `istoric_salarial`
  ADD CONSTRAINT `fk_istoric_angajat` FOREIGN KEY (`id_angajat`) REFERENCES `angajati` (`id_angajat`);

--
-- Constraints for table `manageri`
--
ALTER TABLE `manageri`
  ADD CONSTRAINT `fk_manager_angajat` FOREIGN KEY (`id_angajat`) REFERENCES `angajati` (`id_angajat`),
  ADD CONSTRAINT `fk_manager_departament` FOREIGN KEY (`id_departament`) REFERENCES `departamente` (`id_departament`);

--
-- Constraints for table `notificari`
--
ALTER TABLE `notificari`
  ADD CONSTRAINT `fk_notificare_angajat` FOREIGN KEY (`id_angajat`) REFERENCES `angajati` (`id_angajat`) ON DELETE CASCADE;

--
-- Constraints for table `utilizatori`
--
ALTER TABLE `utilizatori`
  ADD CONSTRAINT `fk_utilizator_angajat` FOREIGN KEY (`id_angajat`) REFERENCES `angajati` (`id_angajat`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
