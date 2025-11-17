"""
Migration: Add period column to xml_uploads table
"""
from sqlalchemy import create_engine, text
from app.config import settings

def upgrade():
    """Add period column to xml_uploads"""
    engine = create_engine(settings.database_url)

    with engine.connect() as conn:
        # Check if column already exists
        result = conn.execute(text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'xml_uploads'
            AND column_name = 'period'
        """))

        if not result.fetchone():
            # Add column
            conn.execute(text("""
                ALTER TABLE xml_uploads
                ADD COLUMN period VARCHAR(20)
            """))
            conn.commit()
            print("✅ Column 'period' added to xml_uploads table")
        else:
            print("ℹ️  Column 'period' already exists")

def downgrade():
    """Remove period column from xml_uploads"""
    engine = create_engine(settings.database_url)

    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE xml_uploads
            DROP COLUMN IF EXISTS period
        """))
        conn.commit()
        print("✅ Column 'period' removed from xml_uploads table")

if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "downgrade":
        downgrade()
    else:
        upgrade()
