USE `my_database`;

-- CATEGORIA 1: ANGAJATI SI IERARHII

-- 1.1 Angajati care nu au fost evaluati in ultimul an
-- Util pentru HR ca sa identifice angajatii neglijati

SELECT
    a.id_angajat,
    a.nume,
    a.prenume,
    d.nume                                              AS departament,
    p.titlu                                             AS pozitie,
    a.salariu_curent,
    ROUND(DATEDIFF(CURDATE(), a.data_angajare) / 365, 1) AS vechime_ani,
    MAX(e.data_evaluare)                                AS ultima_evaluare
FROM angajati a
JOIN departamente d     ON a.id_departament = d.id_departament
JOIN pozitii p          ON a.id_pozitie     = p.id_pozitie
LEFT JOIN evaluari e    ON a.id_angajat     = e.id_angajat
WHERE a.status = 'activ'
GROUP BY
    a.id_angajat, a.nume, a.prenume,
    d.nume, p.titlu, a.salariu_curent, a.data_angajare
HAVING
    MAX(e.data_evaluare) < DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
    OR MAX(e.data_evaluare) IS NULL
ORDER BY ultima_evaluare ASC
LIMIT 20;

-- 1.2 Angajatul cu cel mai mare salariu din fiecare departament

SELECT
    a.nume,
    a.prenume,
    d.nume          AS departament,
    d.locatie,
    p.titlu         AS pozitie,
    p.nivel,
    a.salariu_curent
FROM angajati a
JOIN departamente d ON a.id_departament = d.id_departament
JOIN pozitii p      ON a.id_pozitie     = p.id_pozitie
WHERE a.status = 'activ'
  AND a.salariu_curent = (
      SELECT MAX(a2.salariu_curent)
      FROM angajati a2
      WHERE a2.id_departament = a.id_departament
        AND a2.status = 'activ'
  )
ORDER BY d.nume, d.locatie;

-- 1.3 Clasament angajati per departament dupa salariu (Window Functions)
-- RANK() lasa goluri la egalitate (1,1,3), DENSE_RANK() nu (1,1,2)
-- PARTITION BY reseteaza clasamentul la fiecare departament

SELECT
    a.nume,
    a.prenume,
    d.nume                                              AS departament,
    p.titlu                                             AS pozitie,
    a.salariu_curent,
    RANK() OVER (
        PARTITION BY a.id_departament
        ORDER BY a.salariu_curent DESC
    )                                                   AS rank_salariu,
    DENSE_RANK() OVER (
        PARTITION BY a.id_departament
        ORDER BY a.salariu_curent DESC
    )                                                   AS dense_rank_salariu
FROM angajati a
JOIN departamente d ON a.id_departament = d.id_departament
JOIN pozitii p      ON a.id_pozitie     = p.id_pozitie
WHERE a.status = 'activ'
ORDER BY d.nume, rank_salariu
LIMIT 30;



-- CATEGORIA 2: SALARII SI ANALIZA DE PIATA

-- 2.1 Compa-ratio: cat % din media grilei castiga fiecare angajat
-- Compa-ratio < 80% = subdeplatit, risc mare de plecare
-- Compa-ratio > 120% = platit peste grila pozitiei
-- Formula: (salariu_curent / media_grilei) * 100
SELECT
    a.nume,
    a.prenume,
    d.nume                                              AS departament,
    p.titlu                                             AS pozitie,
    p.nivel,
    a.salariu_curent,
    p.salariu_min,
    p.salariu_max,
    ROUND((p.salariu_min + p.salariu_max) / 2, 2)  AS media_grilei,
    ROUND(
        a.salariu_curent /
        ((p.salariu_min + p.salariu_max) / 2) * 100, 2
    )                                        AS compa_ratio,
    CASE
        WHEN a.salariu_curent < p.salariu_min * 0.80
            THEN 'Subdeplătit critic'
        WHEN a.salariu_curent < (p.salariu_min + p.salariu_max) / 2
            THEN 'Sub media grilei'
        WHEN a.salariu_curent <= p.salariu_max
            THEN 'In grila'
        ELSE 'Peste grila'
    END                                     AS pozitie_in_grila
FROM angajati a
JOIN departamente d ON a.id_departament = d.id_departament
JOIN pozitii p      ON a.id_pozitie     = p.id_pozitie
WHERE a.status = 'activ'
ORDER BY compa_ratio ASC;

-- 2.2 Angajati subplatiti - compa-ratio sub 80%
-- Acestia sunt prioritatea HR pentru revizuire salariala

SELECT
    a.id_angajat,
    a.nume,
    a.prenume,
    d.nume                                              AS departament,
    p.titlu                                             AS pozitie,
    a.salariu_curent,
    ROUND((p.salariu_min + p.salariu_max) / 2, 2)      AS media_grilei,
    ROUND(
        a.salariu_curent /
        ((p.salariu_min + p.salariu_max) / 2) * 100, 2
    )                                                   AS compa_ratio,
    ROUND(
        (p.salariu_min + p.salariu_max) / 2 - a.salariu_curent, 2
    )                                                   AS diferenta_pana_la_medie
FROM angajati a
JOIN departamente d ON a.id_departament = d.id_departament
JOIN pozitii p      ON a.id_pozitie     = p.id_pozitie
WHERE a.status = 'activ'
  AND a.salariu_curent < (p.salariu_min + p.salariu_max) / 2 * 0.80
ORDER BY compa_ratio ASC;

-- 2.3 Raport salarii pe departament cu ROLLUP
-- Randul cu NULL la departament = totalul tuturor departamentelor

SELECT * FROM (
    SELECT
        COALESCE(d.nume, '>>> TOTAL GENERAL') AS departament,
        COALESCE(d.locatie, '---')            AS locatie,
        COUNT(a.id_angajat)                   AS nr_angajati,
        ROUND(MIN(a.salariu_curent), 2)       AS salariu_minim,
        ROUND(MAX(a.salariu_curent), 2)       AS salariu_maxim,
        ROUND(AVG(a.salariu_curent), 2)       AS salariu_mediu,
        ROUND(SUM(a.salariu_curent), 2)       AS masa_salariala
    FROM angajati a
    JOIN departamente d ON a.id_departament = d.id_departament
    WHERE a.status = 'activ'
    GROUP BY d.nume, d.locatie WITH ROLLUP
) AS raport_salarii
ORDER BY 
    CASE WHEN departament = '>>> TOTAL GENERAL' THEN 1 ELSE 0 END ASC,
    masa_salariala DESC;

-- 2.4 Evolutia masei salariale in ultimii 2 ani
-- Foloseste istoric_salarial pentru a vedea trendul costurilor

SELECT
    YEAR(is2.data_modificare)                           AS an,
    MONTH(is2.data_modificare)                          AS luna,
    DATE_FORMAT(is2.data_modificare, '%Y-%m')           AS perioada,
    COUNT(DISTINCT is2.id_angajat)                      AS angajati_cu_modificari,
    ROUND(AVG(is2.salariu_nou - is2.salariu_vechi), 2) AS crestere_medie,
    ROUND(SUM(is2.salariu_nou - is2.salariu_vechi), 2) AS impact_total_masa_salariala
FROM istoric_salarial is2
WHERE is2.data_modificare >= DATE_SUB(CURDATE(), INTERVAL 2 YEAR)
GROUP BY YEAR(is2.data_modificare), MONTH(is2.data_modificare)
ORDER BY an DESC, luna DESC;

-- 2.5 Top 3 salarii per nivel de senioritate (CTE + Window Function)
-- Combina CTE cu DENSE_RANK pentru a filtra doar top 3 per nivel
WITH salarii_ranked AS (
    SELECT
        a.nume,
        a.prenume,
        p.nivel,
        p.titlu                                         AS pozitie,
        a.salariu_curent,
        DENSE_RANK() OVER (
            PARTITION BY p.nivel
            ORDER BY a.salariu_curent DESC
        )                                               AS rang
    FROM angajati a
    JOIN pozitii p ON a.id_pozitie = p.id_pozitie
    WHERE a.status = 'activ'
)
SELECT *
FROM salarii_ranked
WHERE rang <= 3
ORDER BY nivel, rang;



-- CATEGORIA 3: PROIECTE SI ALOCARI

-- 3.1 Proiecte active cu statistici complete
-- Arata bugetul per angajat alocat si zilele pana la deadline

SELECT
    pr.id_proiect,
    pr.nume                                             AS proiect,
    pr.status,
    pr.buget,
    pr.data_start,
    pr.data_sfarsit,
    COUNT(DISTINCT ap.id_angajat)                       AS nr_angajati_alocati,
    SUM(ap.ore_alocate)                                 AS total_ore_alocate,
    ROUND(pr.buget / NULLIF(COUNT(DISTINCT ap.id_angajat), 0), 2)
                                                        AS buget_per_angajat,
    DATEDIFF(pr.data_sfarsit, CURDATE())                AS zile_pana_la_deadline
FROM proiecte pr
LEFT JOIN alocari_proiecte ap ON pr.id_proiect = ap.id_proiect
WHERE pr.status = 'in desfasurare'
GROUP BY
    pr.id_proiect, pr.nume, pr.status,
    pr.buget, pr.data_start, pr.data_sfarsit
ORDER BY zile_pana_la_deadline ASC;

-- 3.2 Angajati supraincarcati - alocati la mai mult de 2 proiecte
-- Supraincarcarea e un factor de risc major pentru churn

SELECT
    a.id_angajat,
    a.nume,
    a.prenume,
    d.nume                                              AS departament,
    p.titlu                                             AS pozitie,
    COUNT(DISTINCT ap.id_proiect)                       AS nr_proiecte_active,
    SUM(ap.ore_alocate)                                 AS total_ore_saptamanale,
    GROUP_CONCAT(pr.nume ORDER BY pr.nume SEPARATOR ', ')
                                                        AS proiecte
FROM angajati a
JOIN departamente d         ON a.id_departament  = d.id_departament
JOIN pozitii p              ON a.id_pozitie      = p.id_pozitie
JOIN alocari_proiecte ap    ON a.id_angajat      = ap.id_angajat
JOIN proiecte pr            ON ap.id_proiect     = pr.id_proiect
WHERE a.status = 'activ'
  AND pr.status = 'in desfasurare'
  AND (ap.data_sfarsit IS NULL OR ap.data_sfarsit > CURDATE())
GROUP BY a.id_angajat, a.nume, a.prenume, d.nume, p.titlu
HAVING COUNT(DISTINCT ap.id_proiect) > 2
ORDER BY nr_proiecte_active DESC, total_ore_saptamanale DESC;

-- 3.3 Angajati activi fara niciun proiect curent (on the bench)

SELECT
    a.id_angajat,
    a.nume,
    a.prenume,
    d.nume                                              AS departament,
    p.titlu                                             AS pozitie,
    p.nivel,
    a.salariu_curent,
    ROUND(DATEDIFF(CURDATE(), a.data_angajare) / 365, 1) AS vechime_ani
FROM angajati a
JOIN departamente d ON a.id_departament = d.id_departament
JOIN pozitii p      ON a.id_pozitie     = p.id_pozitie
WHERE a.status = 'activ'
  AND NOT EXISTS (
      SELECT 1
      FROM alocari_proiecte ap
      JOIN proiecte pr ON ap.id_proiect = pr.id_proiect
      WHERE ap.id_angajat = a.id_angajat
        AND pr.status = 'in desfasurare'
        AND (ap.data_sfarsit IS NULL OR ap.data_sfarsit > CURDATE())
  )
ORDER BY p.nivel DESC, a.salariu_curent DESC;

-- 3.4 Proiecte cu potential de depasire a bugetului
-- Estimeaza costul echipei pe durata proiectului si il compara cu bugetul alocat

SELECT
    pr.nume                                             AS proiect,
    pr.buget,
    pr.data_start,
    pr.data_sfarsit,
    TIMESTAMPDIFF(MONTH, pr.data_start, pr.data_sfarsit)
                                                        AS durata_luni,
    COUNT(DISTINCT ap.id_angajat)                       AS nr_angajati,
    ROUND(SUM(a.salariu_curent), 2)                     AS cost_lunar_echipa,
    ROUND(
        SUM(a.salariu_curent) *
        TIMESTAMPDIFF(MONTH, pr.data_start, pr.data_sfarsit), 2
    )                                                   AS cost_estimat_total,
    ROUND(
        pr.buget - SUM(a.salariu_curent) *
        TIMESTAMPDIFF(MONTH, pr.data_start, pr.data_sfarsit), 2
    )                                                   AS marja_buget
FROM proiecte pr
JOIN alocari_proiecte ap    ON pr.id_proiect = ap.id_proiect
JOIN angajati a             ON ap.id_angajat = a.id_angajat
WHERE pr.status IN ('in desfasurare', 'planificat')
  AND a.status = 'activ'
GROUP BY pr.id_proiect, pr.nume, pr.buget, pr.data_start, pr.data_sfarsit
ORDER BY marja_buget ASC;



-- CATEGORIA 4: EVALUARI SI PERFORMANTA

-- 4.1 Evolutia scorurilor unui angajat in timp
-- Diferenta negativa = performanta in scadere

SELECT
    a.nume,
    a.prenume,
    e.data_evaluare,
    e.scor_tehnic,
    e.scor_comunicare,
    e.scor_leadership,
    e.scor_final,
    LAG(e.scor_final) OVER (
        PARTITION BY e.id_angajat
        ORDER BY e.data_evaluare
    )                                                   AS scor_anterior,
    ROUND(
        e.scor_final - LAG(e.scor_final) OVER (
            PARTITION BY e.id_angajat
            ORDER BY e.data_evaluare
        ), 2
    )                                                   AS variatie_scor
FROM evaluari e
JOIN angajati a ON e.id_angajat = a.id_angajat
ORDER BY a.id_angajat, e.data_evaluare;

-- 4.2 Angajati cu performanta in scadere la ultima evaluare

WITH evolutie_scoruri AS (
    SELECT
        e.id_angajat,
        e.scor_final,
        e.data_evaluare,
        LAG(e.scor_final) OVER (
            PARTITION BY e.id_angajat
            ORDER BY e.data_evaluare
        )                                               AS scor_anterior,
        ROW_NUMBER() OVER (
            PARTITION BY e.id_angajat
            ORDER BY e.data_evaluare DESC
        )                                               AS nr_desc
    FROM evaluari e
)
SELECT
    a.id_angajat,
    a.nume,
    a.prenume,
    d.nume                                              AS departament,
    es.scor_final                                       AS scor_curent,
    es.scor_anterior,
    ROUND(es.scor_final - es.scor_anterior, 2)          AS variatie,
    es.data_evaluare
FROM evolutie_scoruri es
JOIN angajati a     ON es.id_angajat    = a.id_angajat
JOIN departamente d ON a.id_departament = d.id_departament
WHERE es.nr_desc = 1
  AND es.scor_anterior IS NOT NULL
  AND es.scor_final < es.scor_anterior
  AND a.status = 'activ'
ORDER BY variatie ASC;

-- 4.3 Statistici evaluari per departament

SELECT
    d.nume                                              AS departament,
    d.locatie,
    COUNT(e.id_evaluare)                                AS nr_evaluari,
    ROUND(AVG(e.scor_tehnic), 2)                        AS medie_tehnic,
    ROUND(AVG(e.scor_comunicare), 2)                    AS medie_comunicare,
    ROUND(AVG(e.scor_leadership), 2)                    AS medie_leadership,
    ROUND(AVG(e.scor_final), 2)                         AS medie_scor_final,
    SUM(CASE WHEN e.scor_final >= 8 THEN 1 ELSE 0 END) AS angajati_excelenti,
    SUM(CASE WHEN e.scor_final < 5  THEN 1 ELSE 0 END) AS angajati_sub_asteptari
FROM evaluari e
JOIN angajati a     ON e.id_angajat     = a.id_angajat
JOIN departamente d ON a.id_departament = d.id_departament
GROUP BY d.id_departament, d.nume, d.locatie
ORDER BY medie_scor_final DESC;



-- CATEGORIA 5: CONCEDII

-- 5.1 Statistici concedii per tip si departament
-- Numarul mare de concedii medicale poate indica probleme de wellbeing sau management toxic

SELECT
    d.nume                                              AS departament,
    c.tip,
    COUNT(c.id_concediu)                                AS nr_cereri,
    SUM(CASE WHEN c.status = 'aprobat'      THEN 1 ELSE 0 END) AS aprobate,
    SUM(CASE WHEN c.status = 'respins'      THEN 1 ELSE 0 END) AS respinse,
    SUM(CASE WHEN c.status = 'in asteptare' THEN 1 ELSE 0 END) AS in_asteptare,
    ROUND(
        SUM(CASE WHEN c.status = 'aprobat' THEN 1 ELSE 0 END) /
        COUNT(c.id_concediu) * 100, 2
    )                                                   AS rata_aprobare_procent,
    ROUND(AVG(DATEDIFF(c.data_sfarsit, c.data_start)), 1)
                                                        AS durata_medie_zile
FROM concedii c
JOIN angajati a     ON c.id_angajat     = a.id_angajat
JOIN departamente d ON a.id_departament = d.id_departament
GROUP BY d.id_departament, d.nume, c.tip
ORDER BY d.nume, nr_cereri DESC;

-- 5.2 Rata de aprobare a concediilor per manager
-- Managerii cu rata de aprobare foarte mica pot fi o cauza directa a nemultumirilor si a churn-ului

SELECT
    a_mgr.nume                                          AS nume_manager,
    a_mgr.prenume                                       AS prenume_manager,
    m.tip                                               AS tip_manager,
    d.nume                                              AS departament,
    COUNT(c.id_concediu)                                AS total_cereri,
    SUM(CASE WHEN c.status = 'aprobat' THEN 1 ELSE 0 END) AS aprobate,
    SUM(CASE WHEN c.status = 'respins' THEN 1 ELSE 0 END) AS respinse,
    ROUND(
        SUM(CASE WHEN c.status = 'aprobat' THEN 1 ELSE 0 END) /
        COUNT(c.id_concediu) * 100, 2
    )                                                   AS rata_aprobare_procent
FROM concedii c
JOIN manageri m     ON c.id_aprobator   = m.id_manager
JOIN angajati a_mgr ON m.id_angajat     = a_mgr.id_angajat
JOIN departamente d ON m.id_departament = d.id_departament
GROUP BY m.id_manager, a_mgr.nume, a_mgr.prenume, m.tip, d.nume
HAVING COUNT(c.id_concediu) > 0
ORDER BY rata_aprobare_procent ASC;

-- 5.3 Angajatii cu cele mai multe zile de concediu medical
-- Indicator important pentru wellbeing si risc de burnout

SELECT
    a.id_angajat,
    a.nume,
    a.prenume,
    d.nume                                              AS departament,
    p.titlu                                             AS pozitie,
    COUNT(c.id_concediu)                                AS nr_concedii_medicale,
    SUM(DATEDIFF(c.data_sfarsit, c.data_start))         AS total_zile_medicale,
    ROUND(AVG(DATEDIFF(c.data_sfarsit, c.data_start)), 1)
                                                        AS medie_zile_per_concediu
FROM angajati a
JOIN departamente d ON a.id_departament = d.id_departament
JOIN pozitii p      ON a.id_pozitie     = p.id_pozitie
JOIN concedii c     ON a.id_angajat     = c.id_angajat
WHERE c.tip = 'boala'
  AND c.status = 'aprobat'
  AND a.status = 'activ'
GROUP BY a.id_angajat, a.nume, a.prenume, d.nume, p.titlu
ORDER BY total_zile_medicale DESC
LIMIT 20;

-- 5.4 Concedii programate in urmatoarele 30 de zile
-- Planificare resurse: cine va lipsi in urmatoarea luna

SELECT
    a.nume,
    a.prenume,
    d.nume                                              AS departament,
    p.titlu                                             AS pozitie,
    c.tip,
    c.data_start,
    c.data_sfarsit,
    DATEDIFF(c.data_sfarsit, c.data_start)              AS nr_zile,
    c.status
FROM concedii c
JOIN angajati a     ON c.id_angajat     = a.id_angajat
JOIN departamente d ON a.id_departament = d.id_departament
JOIN pozitii p      ON a.id_pozitie     = p.id_pozitie
WHERE c.data_start BETWEEN CURDATE()
                       AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
  AND c.status IN ('aprobat', 'in asteptare')
  AND a.status = 'activ'
ORDER BY c.data_start ASC;
