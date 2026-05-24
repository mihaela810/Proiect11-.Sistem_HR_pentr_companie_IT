import mysql.connector
import bcrypt
import unicodedata
import re

DB_CONFIG = {
    'host':     'db',        # <-- era 'localhost', acum e 'db' pentru Docker
    'user':     'root',
    'password': '',
    'database': 'my_database'
}

PAROLA_TEST = 'test123'

def hash_parola(parola):
    return bcrypt.hashpw(parola.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def normalizeaza(text):
    nfkd = unicodedata.normalize('NFKD', text)
    ascii_str = ''.join(c for c in nfkd if not unicodedata.combining(c))
    return re.sub(r'[^a-zA-Z0-9._-]', '', ascii_str).lower()

def username_unic(cursor, prenume, nume):
    base     = f"{normalizeaza(prenume)}.{normalizeaza(nume)}"
    username = base
    suffix   = 1
    while True:
        cursor.execute(
            "SELECT id_utilizator FROM `utilizatori` WHERE username = %s",
            (username,)
        )
        if not cursor.fetchone():
            return username
        username = f"{base}{suffix}"
        suffix  += 1

def insert_utilizator(cursor, id_angajat, username, parola_hash, rol):
    cursor.execute("""
        INSERT INTO `utilizatori` (id_angajat, username, parola_hash, rol, activ)
        VALUES (%s, %s, %s, %s, 1)
    """, (id_angajat, username, parola_hash, rol))

def update_id_manager(cursor, id_angajat_subordonat, id_angajat_manager):
    # gasim id_manager din tabela manageri pentru angajatul manager
    cursor.execute(
        "SELECT id_manager FROM `manageri` WHERE id_angajat = %s LIMIT 1",
        (id_angajat_manager,)
    )
    row = cursor.fetchone()
    if row:
        cursor.execute(
            "UPDATE `angajati` SET id_manager = %s WHERE id_angajat = %s",
            (row['id_manager'], id_angajat_subordonat)
        )

def get_orase(cursor):
    cursor.execute("SELECT DISTINCT locatie FROM `departamente` ORDER BY locatie")
    return [r['locatie'] for r in cursor.fetchall()]

def get_departamente_hr(cursor):
    cursor.execute("""
        SELECT id_departament, locatie
        FROM `departamente`
        WHERE nume IN ('HR', 'Human Resources')
        ORDER BY locatie
    """)
    return cursor.fetchall()

def get_manageri_tip(cursor, tip):
    cursor.execute("""
        SELECT m.id_angajat, a.nume, a.prenume
        FROM `manageri` m
        JOIN `angajati` a ON m.id_angajat = a.id_angajat
        WHERE m.tip = %s AND a.status = 'activ'
    """, (tip,))
    return cursor.fetchall()

def get_angajati_din_dept(cursor, id_departament):
    cursor.execute("""
        SELECT id_angajat, nume, prenume
        FROM `angajati`
        WHERE id_departament = %s AND status = 'activ'
    """, (id_departament,))
    return cursor.fetchall()

def selecteaza_angajat_disponibil(cursor, where_extra, params_extra, angajati_cu_rol):
    """
    Selecteaza un angajat activ care NU e deja in angajati_cu_rol.
    where_extra: conditie SQL aditionala (ex: "AND d.locatie = %s")
    params_extra: parametrii pentru where_extra
    """
    exclude = list(angajati_cu_rol) if angajati_cu_rol else [0]
    ph = ','.join(['%s'] * len(exclude))
    cursor.execute(f"""
        SELECT a.id_angajat, a.nume, a.prenume
        FROM `angajati` a
        JOIN `departamente` d ON a.id_departament = d.id_departament
        WHERE a.status = 'activ'
        AND a.id_angajat NOT IN ({ph})
        {where_extra}
        ORDER BY a.salariu_curent DESC
        LIMIT 1
    """, exclude + params_extra)
    return cursor.fetchone()

def selecteaza_angajat_din_dept(cursor, id_departament, angajati_cu_rol):
    exclude = list(angajati_cu_rol) if angajati_cu_rol else [0]
    ph = ','.join(['%s'] * len(exclude))
    cursor.execute(f"""
        SELECT id_angajat, nume, prenume
        FROM `angajati`
        WHERE status = 'activ'
        AND id_departament = %s
        AND id_angajat NOT IN ({ph})
        ORDER BY salariu_curent DESC
        LIMIT 1
    """, [id_departament] + exclude)
    return cursor.fetchone()

def main():
    conn   = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor(dictionary=True)

    angajati_cu_rol = set()
    conturi_test    = {}

    try:
        # ── 1. Enum ──────────────────────────────────────────────────────────
        print("\n[1/6] Verificare enum...")
        cursor.execute("SHOW COLUMNS FROM `utilizatori` LIKE 'rol'")
        col = cursor.fetchone()
        if col and 'app_readonly' not in col['Type']:
            cursor.execute("""
                ALTER TABLE `utilizatori`
                MODIFY COLUMN `rol`
                ENUM('hr_specialist','hr_manager','team_leader',
                     'project_manager','director','ceo','app_readonly')
                NOT NULL
            """)
            print("app_readonly adaugat in enum")
        else:
            print("enum ok")
        conn.commit()

        # ── 2. Sterge utilizatori ────────────────────────────────────────────
        print("\n[2/6] Stergere utilizatori existenti...")
        cursor.execute("DELETE FROM `utilizatori`")
        conn.commit()
        print("Stergere completa")

        parola_hash = hash_parola(PAROLA_TEST)

        # ── 3. CEO ───────────────────────────────────────────────────────────
        print("\n[3/6] Creare CEO...")
        cursor.execute("""
            SELECT id_angajat, nume, prenume FROM `angajati`
            WHERE status = 'activ'
            ORDER BY salariu_curent DESC LIMIT 1
        """)
        ceo = cursor.fetchone()
        ceo_user = username_unic(cursor, ceo['prenume'], ceo['nume'])
        insert_utilizator(cursor, ceo['id_angajat'], ceo_user, parola_hash, 'ceo')
        angajati_cu_rol.add(ceo['id_angajat'])
        conturi_test['ceo'] = {
            'username':     ceo_user,
            'nume_complet': f"{ceo['prenume']} {ceo['nume']}"
        }
        print(f"  ✓ CEO: {ceo_user} ({ceo['prenume']} {ceo['nume']})")
        conn.commit()

        # ── 4. Directori (1 per oras, independent de alte roluri) ────────────
        print("\n[4/6] Creare directori si HR managers...")
        orase = get_orase(cursor)

        # Mapam oras -> id_angajat director (pentru a seta subordonatii ulterior)
        directori_per_oras = {}
        director_test_facut   = False
        hr_manager_test_facut = False

        for oras in orase:
            # Cautam angajatul cu salariul cel mai mare din oras
            # care nu are deja un rol
            ang = selecteaza_angajat_disponibil(
                cursor,
                "AND d.locatie = %s",
                [oras],
                angajati_cu_rol
            )
            if not ang:
                print(f"Nu s-a gasit director pentru {oras}")
                continue

            dir_user = username_unic(cursor, ang['prenume'], ang['nume'])
            insert_utilizator(cursor, ang['id_angajat'], dir_user, parola_hash, 'director')
            angajati_cu_rol.add(ang['id_angajat'])
            directori_per_oras[oras] = ang['id_angajat']

            if not director_test_facut:
                conturi_test['director'] = {
                    'username':     dir_user,
                    'nume_complet': f"{ang['prenume']} {ang['nume']}",
                    'oras':         oras
                }
                director_test_facut = True
            print(f"Director {oras}: {dir_user}")

        conn.commit()

        # Inseram directorii in tabela manageri si setam id_manager
        for oras, id_dir in directori_per_oras.items():
    # verificam daca directorul e deja in manageri
            cursor.execute(
                "SELECT id_manager FROM manageri WHERE id_angajat = %s LIMIT 1",
                (id_dir,)
            )
            mgr_row = cursor.fetchone()
            if not mgr_row:
        # obtinem id_departament al directorului
                cursor.execute(
                    "SELECT id_departament FROM angajati WHERE id_angajat = %s",
                    (id_dir,)
                )
                dept_row = cursor.fetchone()
                cursor.execute("""
                    INSERT INTO manageri (id_angajat, id_departament, data_numire, bonus_management, tip)
                    VALUES (%s, %s, CURDATE(), 0, 'director')
                """, (id_dir, dept_row['id_departament']))
                conn.commit()
                cursor.execute(
                    "SELECT id_manager FROM manageri WHERE id_angajat = %s LIMIT 1",
                    (id_dir,)
                )
                mgr_row = cursor.fetchone()

            id_manager_val = mgr_row['id_manager']

    # setam id_manager pentru toti angajatii din oras
            cursor.execute("""
                UPDATE angajati a
                JOIN departamente d ON a.id_departament = d.id_departament
                SET a.id_manager = %s
                WHERE d.locatie = %s
                AND a.status = 'activ'
                AND a.id_angajat != %s
            """, (id_manager_val, oras, id_dir))

        conn.commit()
        print(f"id_manager setat pentru angajatii per oras")

        # HR Managers (1 per oras, din departamentul HR)
        hr_depts = get_departamente_hr(cursor)
        hr_mgr_per_dept = {}

        for dept in hr_depts:
            ang = selecteaza_angajat_din_dept(cursor, dept['id_departament'], angajati_cu_rol)
            if not ang:
                print(f"Nu s-a gasit HR Manager pentru {dept['locatie']}")
                continue

            hr_user = username_unic(cursor, ang['prenume'], ang['nume'])
            insert_utilizator(cursor, ang['id_angajat'], hr_user, parola_hash, 'hr_manager')
            angajati_cu_rol.add(ang['id_angajat'])
            hr_mgr_per_dept[dept['id_departament']] = ang['id_angajat']

            if not hr_manager_test_facut:
                conturi_test['hr_manager'] = {
                    'username':     hr_user,
                    'nume_complet': f"{ang['prenume']} {ang['nume']}",
                    'oras':         dept['locatie']
                }
                hr_manager_test_facut = True
            print(f"HR Manager {dept['locatie']}: {hr_user}")

        conn.commit()

        # ── 5. Team Leaders, Project Managers, HR Specialists ────────────────
        print("\n[5/6] Creare team leaders, project managers, HR specialists...")

        # Team Leaders
        tl_test_facut = False
        tl_count      = 0
        for tl in get_manageri_tip(cursor, 'team_leader'):
            if tl['id_angajat'] in angajati_cu_rol:
                continue
            tl_user = username_unic(cursor, tl['prenume'], tl['nume'])
            insert_utilizator(cursor, tl['id_angajat'], tl_user, parola_hash, 'team_leader')
            angajati_cu_rol.add(tl['id_angajat'])
            tl_count += 1
            if not tl_test_facut:
                conturi_test['team_leader'] = {
                    'username':     tl_user,
                    'nume_complet': f"{tl['prenume']} {tl['nume']}"
                }
                tl_test_facut = True
        print(f"{tl_count} team leaders creati")

        # Project Managers
        pm_test_facut = False
        pm_count      = 0
        for pm in get_manageri_tip(cursor, 'project_manager'):
            if pm['id_angajat'] in angajati_cu_rol:
                continue
            pm_user = username_unic(cursor, pm['prenume'], pm['nume'])
            insert_utilizator(cursor, pm['id_angajat'], pm_user, parola_hash, 'project_manager')
            angajati_cu_rol.add(pm['id_angajat'])
            pm_count += 1
            if not pm_test_facut:
                conturi_test['project_manager'] = {
                    'username':     pm_user,
                    'nume_complet': f"{pm['prenume']} {pm['nume']}"
                }
                pm_test_facut = True
        print(f"{pm_count} project managers creati")

        # HR Specialists (restul angajatilor din dept HR)
        hr_spec_test_facut = False
        hr_spec_count      = 0
        for dept in hr_depts:
            for ang in get_angajati_din_dept(cursor, dept['id_departament']):
                if ang['id_angajat'] in angajati_cu_rol:
                    continue
                hr_user = username_unic(cursor, ang['prenume'], ang['nume'])
                insert_utilizator(cursor, ang['id_angajat'], hr_user, parola_hash, 'hr_specialist')
                angajati_cu_rol.add(ang['id_angajat'])
                hr_spec_count += 1
                if not hr_spec_test_facut:
                    conturi_test['hr_specialist'] = {
                        'username':     hr_user,
                        'nume_complet': f"{ang['prenume']} {ang['nume']}"
                    }
                    hr_spec_test_facut = True
        print(f"{hr_spec_count} HR specialists creati")
        conn.commit()

        # ── 6. App Readonly (toti ceilalti) ──────────────────────────────────
        print("\n[6/6] Creare conturi app_readonly...")
        exclude = list(angajati_cu_rol)
        ph = ','.join(['%s'] * len(exclude))
        cursor.execute(f"""
            SELECT id_angajat, nume, prenume FROM `angajati`
            WHERE status = 'activ'
            AND id_angajat NOT IN ({ph})
        """, exclude)
        restul = cursor.fetchall()

        ro_test_facut = False
        ro_count      = 0
        for ang in restul:
            ro_user = username_unic(cursor, ang['prenume'], ang['nume'])
            insert_utilizator(cursor, ang['id_angajat'], ro_user, parola_hash, 'app_readonly')
            ro_count += 1
            if not ro_test_facut:
                conturi_test['app_readonly'] = {
                    'username':     ro_user,
                    'nume_complet': f"{ang['prenume']} {ang['nume']}"
                }
                ro_test_facut = True
        conn.commit()
        print(f"{ro_count} conturi app_readonly create")

        # ── Sumar final ──────────────────────────────────────────────────────
        print("\n" + "=" * 65)
        print("  DISTRIBUTIA FINALA A ROLURILOR")
        print("=" * 65)
        cursor.execute("""
            SELECT rol, COUNT(*) as nr FROM `utilizatori`
            GROUP BY rol
            ORDER BY FIELD(rol,'ceo','director','hr_manager',
                           'hr_specialist','team_leader',
                           'project_manager','app_readonly')
        """)
        total = 0
        for row in cursor.fetchall():
            print(f"  {row['rol']:<22} {row['nr']:>6} conturi")
            total += row['nr']
        print(f"  {'TOTAL':<22} {total:>6} conturi")

        print("\n" + "=" * 65)
        print("  CONTURI DE TEST — parola: test123 pentru toate")
        print("=" * 65)
        for rol in ['ceo','director','hr_manager','hr_specialist',
                    'team_leader','project_manager','app_readonly']:
            if rol in conturi_test:
                c = conturi_test[rol]
                print(f"  {rol:<22} {c['username']:<30} ({c['nume_complet']})")
        print("=" * 65 + "\n")

    except Exception as e:
        conn.rollback()
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    main()