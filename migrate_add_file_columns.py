"""
Script para agregar columnas de archivos a la tabla direct_messages
Ejecutar: python migrate_add_file_columns.py
"""
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:password@localhost:5432/groupsapp"

engine = create_engine(DATABASE_URL)

sql_commands = [
    "ALTER TABLE direct_messages ALTER COLUMN content DROP NOT NULL;",
    "ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS file_name VARCHAR;",
    "ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS file_path VARCHAR;",
    "ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS file_size INTEGER;",
    "ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS file_type VARCHAR;",
]

if __name__ == "__main__":
    print("🔄 Actualizando base de datos...")
    
    with engine.connect() as conn:
        for sql in sql_commands:
            try:
                conn.execute(text(sql))
                conn.commit()
                print(f"✅ {sql}")
            except Exception as e:
                print(f"⚠️  {sql} - {e}")
    
    print("\n✨ Migración completada!")
    print("\nNuevas columnas agregadas a direct_messages:")
    print("  - file_name (VARCHAR)")
    print("  - file_path (VARCHAR)")
    print("  - file_size (INTEGER)")
    print("  - file_type (VARCHAR)")
