-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 09, 2026 at 09:34 PM
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
  `telefon` varchar(255) NOT NULL,
  `=data_angajare` date NOT NULL,
  `id_departament` int(11) NOT NULL,
  `id_pozitie` int(11) NOT NULL,
  `id_manager` int(11) DEFAULT NULL,
  `status` enum('activ','inactiv') NOT NULL DEFAULT 'activ'
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
  `scor tehnic` int(11) NOT NULL,
  `scor_comunicare` int(11) NOT NULL,
  `scor_leadership` int(11) NOT NULL,
  `scor_final` decimal(5,2) NOT NULL,
  `feedback` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `nr_subordonati` int(11) NOT NULL,
  `bonus_management` decimal(7,2) NOT NULL,
  `tip` enum('team_leader','project_manager','director') NOT NULL
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
  `nivel` enum('entry','mid','senior','consultant') NOT NULL
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

--
-- Indexes for dumped tables
--

--
-- Indexes for table `alocari_proiecte`
--
ALTER TABLE `alocari_proiecte`
  ADD PRIMARY KEY (`id_alocare`);

--
-- Indexes for table `angajati`
--
ALTER TABLE `angajati`
  ADD PRIMARY KEY (`id_angajat`);

--
-- Indexes for table `beneficii`
--
ALTER TABLE `beneficii`
  ADD PRIMARY KEY (`id_beneficiu`);

--
-- Indexes for table `beneficii_angajati`
--
ALTER TABLE `beneficii_angajati`
  ADD PRIMARY KEY (`id_angajat`,`id_beneficiu`);

--
-- Indexes for table `concedii`
--
ALTER TABLE `concedii`
  ADD PRIMARY KEY (`id_concediu`);

--
-- Indexes for table `departamente`
--
ALTER TABLE `departamente`
  ADD PRIMARY KEY (`id_departament`);

--
-- Indexes for table `evaluari`
--
ALTER TABLE `evaluari`
  ADD PRIMARY KEY (`id_evaluare`);

--
-- Indexes for table `istoric_salarial`
--
ALTER TABLE `istoric_salarial`
  ADD PRIMARY KEY (`id_istoric`);

--
-- Indexes for table `manageri`
--
ALTER TABLE `manageri`
  ADD PRIMARY KEY (`id_manager`);

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
-- AUTO_INCREMENT for table `pozitii`
--
ALTER TABLE `pozitii`
  MODIFY `id_pozitie` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `proiecte`
--
ALTER TABLE `proiecte`
  MODIFY `id_proiect` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
