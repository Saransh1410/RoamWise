import json
import sqlite3
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from app.core.config import settings
from app.schemas.itinerary import ItineraryResponse

logger = logging.getLogger("roamwise.db")


class DatabaseService:
    """
    Dual-mode persistence service:
    - If SUPABASE_URL and SUPABASE_KEY are provided and table 'trips' exists, operations run against Supabase.
    - Otherwise, automatically uses explicit local SQLite database.
    - Does NOT silently ignore Supabase errors when Supabase is active.
    """

    def __init__(self):
        self.supabase_client = None
        self.active_provider = "sqlite"
        self._init_provider()
        self._init_sqlite()

    def _init_provider(self):
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                from supabase import create_client
                client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
                # Verify if trips table exists
                try:
                    client.table("trips").select("id").limit(1).execute()
                    self.supabase_client = client
                    self.active_provider = "supabase"
                    logger.info("[DB] Supabase PostgreSQL connected and 'trips' table verified active!")
                except Exception as table_err:
                    err_str = str(table_err)
                    if "PGRST205" in err_str or "schema cache" in err_str or "does not exist" in err_str:
                        logger.warning(
                            "[DB] Supabase connected, but 'trips' table is not created yet. "
                            "Please run backend/migrations/001_initial_schema.sql in Supabase SQL Editor. "
                            "Active database: SQLite until table is created."
                        )
                    else:
                        logger.warning(f"[DB] Supabase table check note: {table_err}")
                    self.supabase_client = None
                    self.active_provider = "sqlite"
            except Exception as e:
                logger.error(f"[DB] Supabase initialization failed: {e}. Defaulting to SQLite.")
                self.supabase_client = None
                self.active_provider = "sqlite"
        else:
            self.active_provider = "sqlite"
            logger.info("[DB] Supabase credentials not provided. Active database: SQLite.")

    def _get_sqlite_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(settings.DATABASE_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_sqlite(self):
        conn = self._get_sqlite_conn()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS trips (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                title TEXT NOT NULL,
                destination TEXT NOT NULL,
                country TEXT DEFAULT '',
                start_date TEXT,
                end_date TEXT,
                duration_days INTEGER NOT NULL,
                traveler_count INTEGER DEFAULT 2,
                estimated_total_cost REAL DEFAULT 0.0,
                currency TEXT DEFAULT 'USD',
                itinerary_data TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        
        # Check and migrate columns dynamically for existing databases
        cursor.execute("PRAGMA table_info(trips)")
        existing_cols = {row["name"] for row in cursor.fetchall()}
        
        needed_cols = [
            ("user_id", "TEXT"),
            ("start_date", "TEXT"),
            ("end_date", "TEXT"),
            ("traveler_count", "INTEGER DEFAULT 2"),
        ]
        for col_name, col_type in needed_cols:
            if col_name not in existing_cols:
                try:
                    cursor.execute(f"ALTER TABLE trips ADD COLUMN {col_name} {col_type}")
                    logger.info(f"[DB:SQLite] Migrated column: {col_name}")
                except Exception as ex:
                    logger.warning(f"[DB:SQLite] Column check note for {col_name}: {ex}")

        # Indexes for SQLite
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sqlite_destination ON trips(destination)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sqlite_updated_at ON trips(updated_at DESC)")
        conn.commit()
        conn.close()

    def _validate_uuid(self, trip_id: str) -> str:
        try:
            return str(uuid.UUID(str(trip_id)))
        except (ValueError, TypeError, AttributeError):
            return str(uuid.uuid5(uuid.NAMESPACE_DNS, str(trip_id)))

    def save_trip(self, trip: ItineraryResponse, user_id: Optional[str] = None) -> str:
        trip_uuid = self._validate_uuid(trip.id)
        trip.id = trip_uuid
        now_iso = datetime.now(timezone.utc).isoformat()

        # 1. Supabase execution when active
        if self.active_provider == "supabase" and self.supabase_client:
            payload = {
                "id": trip.id,
                "user_id": user_id,
                "title": trip.title,
                "destination": trip.destination,
                "country": trip.country,
                "start_date": trip.start_date,
                "end_date": trip.end_date,
                "duration_days": trip.duration_days,
                "traveler_count": trip.traveler_count,
                "currency": trip.currency,
                "estimated_total_cost": float(trip.estimated_total_cost),
                "itinerary_data": trip.model_dump(),
                "updated_at": now_iso
            }
            try:
                res = self.supabase_client.table("trips").upsert(payload).execute()
                logger.info(f"[DB:Supabase] Saved trip {trip.id}")
                return trip.id
            except Exception as e:
                logger.error(f"[DB:Supabase] Save operation failed: {e}")
                raise RuntimeError(f"Supabase database error: {str(e)}")

        # 2. Local SQLite execution
        conn = self._get_sqlite_conn()
        cursor = conn.cursor()
        try:
            cursor.execute("""
                INSERT INTO trips (
                    id, user_id, title, destination, country, start_date, end_date,
                    duration_days, traveler_count, estimated_total_cost, currency,
                    itinerary_data, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    title = excluded.title,
                    destination = excluded.destination,
                    country = excluded.country,
                    start_date = excluded.start_date,
                    end_date = excluded.end_date,
                    duration_days = excluded.duration_days,
                    traveler_count = excluded.traveler_count,
                    estimated_total_cost = excluded.estimated_total_cost,
                    currency = excluded.currency,
                    itinerary_data = excluded.itinerary_data,
                    updated_at = excluded.updated_at
            """, (
                trip.id,
                user_id,
                trip.title,
                trip.destination,
                trip.country,
                trip.start_date,
                trip.end_date,
                trip.duration_days,
                trip.traveler_count,
                trip.estimated_total_cost,
                trip.currency,
                json.dumps(trip.model_dump()),
                trip.created_at or now_iso,
                now_iso
            ))
            conn.commit()
            logger.info(f"[DB:SQLite] Saved trip {trip.id}")
            return trip.id
        except Exception as e:
            logger.error(f"[DB:SQLite] Save operation failed: {e}")
            raise RuntimeError(f"SQLite database error: {str(e)}")
        finally:
            conn.close()

    def get_trip(self, trip_id: str) -> Optional[ItineraryResponse]:
        clean_uuid = self._validate_uuid(trip_id)

        if self.active_provider == "supabase" and self.supabase_client:
            try:
                res = self.supabase_client.table("trips").select("itinerary_data").eq("id", clean_uuid).execute()
                if res.data and len(res.data) > 0:
                    raw_data = res.data[0]["itinerary_data"]
                    return ItineraryResponse.model_validate(raw_data)
                return None
            except Exception as e:
                logger.error(f"[DB:Supabase] Fetch operation failed: {e}")
                raise RuntimeError(f"Supabase database error: {str(e)}")

        conn = self._get_sqlite_conn()
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT itinerary_data FROM trips WHERE id = ?", (clean_uuid,))
            row = cursor.fetchone()
            if row:
                raw_data = json.loads(row["itinerary_data"])
                return ItineraryResponse.model_validate(raw_data)
            return None
        except Exception as e:
            logger.error(f"[DB:SQLite] Fetch operation failed: {e}")
            raise RuntimeError(f"SQLite database error: {str(e)}")
        finally:
            conn.close()

    def list_trips(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if self.active_provider == "supabase" and self.supabase_client:
            try:
                query = self.supabase_client.table("trips").select(
                    "id, title, destination, country, start_date, end_date, duration_days, traveler_count, estimated_total_cost, currency, created_at, updated_at"
                )
                if user_id:
                    query = query.eq("user_id", user_id)
                res = query.order("updated_at", desc=True).execute()
                return res.data or []
            except Exception as e:
                logger.error(f"[DB:Supabase] List operation failed: {e}")
                raise RuntimeError(f"Supabase database error: {str(e)}")

        conn = self._get_sqlite_conn()
        cursor = conn.cursor()
        try:
            if user_id:
                cursor.execute("""
                    SELECT id, title, destination, country, start_date, end_date, duration_days, traveler_count, estimated_total_cost, currency, created_at, updated_at
                    FROM trips WHERE user_id = ? ORDER BY updated_at DESC
                """, (user_id,))
            else:
                cursor.execute("""
                    SELECT id, title, destination, country, start_date, end_date, duration_days, traveler_count, estimated_total_cost, currency, created_at, updated_at
                    FROM trips ORDER BY updated_at DESC
                """)
            rows = cursor.fetchall()
            return [dict(r) for r in rows]
        except Exception as e:
            logger.error(f"[DB:SQLite] List operation failed: {e}")
            raise RuntimeError(f"SQLite database error: {str(e)}")
        finally:
            conn.close()

    def delete_trip(self, trip_id: str, user_id: Optional[str] = None) -> bool:
        clean_uuid = self._validate_uuid(trip_id)

        if self.active_provider == "supabase" and self.supabase_client:
            try:
                query = self.supabase_client.table("trips").delete().eq("id", clean_uuid)
                if user_id:
                    query = query.eq("user_id", user_id)
                res = query.execute()
                return len(res.data) > 0 if res.data else True
            except Exception as e:
                logger.error(f"[DB:Supabase] Delete operation failed: {e}")
                raise RuntimeError(f"Supabase database error: {str(e)}")

        conn = self._get_sqlite_conn()
        cursor = conn.cursor()
        try:
            if user_id:
                cursor.execute("DELETE FROM trips WHERE id = ? AND user_id = ?", (clean_uuid, user_id))
            else:
                cursor.execute("DELETE FROM trips WHERE id = ?", (clean_uuid,))
            deleted = cursor.rowcount > 0
            conn.commit()
            return deleted
        except Exception as e:
            logger.error(f"[DB:SQLite] Delete operation failed: {e}")
            raise RuntimeError(f"SQLite database error: {str(e)}")
        finally:
            conn.close()

    def get_status(self) -> Dict[str, Any]:
        return {
            "active_database": self.active_provider,
            "supabase_configured": bool(settings.SUPABASE_URL and settings.SUPABASE_KEY),
            "sqlite_path": settings.DATABASE_PATH,
            "is_supabase_active": self.active_provider == "supabase",
        }


db_service = DatabaseService()
