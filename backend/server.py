from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import mimetypes
import bcrypt
import jwt
import logging
import shutil
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# --- File Type Detection ---
FILE_TYPE_MAP = {
    "image": {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp", ".ico", ".avif", ".heic", ".heif"},
    "video": {".mp4", ".mov", ".webm", ".avi", ".mkv", ".flv", ".wmv", ".m4v"},
    "audio": {".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac", ".opus", ".wma"},
    "font": {".ttf", ".otf", ".woff", ".woff2", ".eot"},
    "archive": {".zip", ".rar", ".7z", ".tar", ".gz", ".bz2", ".xz", ".tgz"},
    "document": {".pdf", ".docx", ".doc", ".txt", ".md", ".rtf", ".xlsx", ".xls", ".pptx", ".ppt", ".odt", ".ods", ".csv"},
    "code": {".js", ".ts", ".jsx", ".tsx", ".html", ".css", ".scss", ".sass", ".less", ".json", ".xml", ".yml", ".yaml", ".py", ".java", ".cpp", ".c", ".h", ".cs", ".go", ".rs", ".rb", ".php", ".swift", ".kt", ".sh", ".sql", ".vue", ".svelte", ".dart"},
    "3d": {".obj", ".fbx", ".blend", ".glb", ".gltf", ".stl", ".dae", ".3ds", ".ply", ".usdz"},
    "design": {".fig", ".sketch", ".xd", ".psd", ".ai", ".eps", ".indd"},
}

def detect_file_type(ext: str) -> str:
    ext = ext.lower()
    for ftype, exts in FILE_TYPE_MAP.items():
        if ext in exts:
            return ftype
    return "other"

def human_size(size_bytes: int) -> str:
    for unit in ["B", "KB", "MB", "GB"]:
        if size_bytes < 1024:
            return f"{size_bytes:.1f} {unit}" if unit != "B" else f"{int(size_bytes)} B"
        size_bytes /= 1024
    return f"{size_bytes:.1f} TB"

# --- Setup ---
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
UPLOAD_DIR = Path(os.environ.get('UPLOAD_DIR', '/app/backend/uploads'))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALG = "HS256"

app = FastAPI(title="LazR Hub API")
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Helpers ---
def now_utc() -> str:
    return datetime.now(timezone.utc).isoformat()

def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_pw(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False

def create_token(user_id: str, email: str, days: int = 7) -> str:
    payload = {"sub": user_id, "email": email,
               "exp": datetime.now(timezone.utc) + timedelta(days=days)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"user_id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def optional_user(request: Request) -> Optional[dict]:
    try:
        return await get_current_user(request)
    except HTTPException:
        return None

# --- Models ---
class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    name: str
    username: Optional[str] = None

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class AssetCreate(BaseModel):
    title: str
    description: str = ""
    category: str
    tags: List[str] = []
    license: str = "Free"
    preview_url: str = ""
    file_url: str = ""
    file_size: str = ""
    file_size_bytes: int = 0
    original_filename: str = ""
    file_ext: str = ""
    mime_type: str = ""
    file_type: str = "other"
    version: str = "1.0.0"
    gallery: List[str] = []

class CommentIn(BaseModel):
    text: str

class CollectionIn(BaseModel):
    name: str
    description: str = ""
    cover_image: str = ""
    asset_ids: List[str] = []

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None
    banner: Optional[str] = None
    twitter: Optional[str] = None
    instagram: Optional[str] = None
    website: Optional[str] = None

# --- Auth Endpoints ---
def set_auth_cookie(resp: Response, token: str):
    resp.set_cookie(key="access_token", value=token, httponly=True,
                    secure=True, samesite="none", max_age=604800, path="/")

@api.post("/auth/register")
async def register(data: RegisterIn, response: Response):
    email = data.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    username = data.username or email.split("@")[0]
    doc = {
        "user_id": user_id,
        "email": email,
        "name": data.name,
        "username": username,
        "password_hash": hash_pw(data.password),
        "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={username}",
        "banner": "",
        "bio": "",
        "verified": False,
        "followers": [],
        "following": [],
        "twitter": "", "instagram": "", "website": "",
        "created_at": now_utc(),
    }
    await db.users.insert_one(doc)
    token = create_token(user_id, email)
    set_auth_cookie(response, token)
    doc.pop("password_hash", None)
    doc.pop("_id", None)
    return {"user": doc, "token": token}

@api.post("/auth/login")
async def login(data: LoginIn, response: Response):
    email = data.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_pw(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(user["user_id"], email)
    set_auth_cookie(response, token)
    user.pop("password_hash", None)
    user.pop("_id", None)
    return {"user": user, "token": token}

@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}

@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user

# --- Categories ---
CATEGORIES = [
    {"slug": "wallpapers", "name": "Wallpapers", "icon": "Image"},
    {"slug": "icons", "name": "Icons", "icon": "Sparkles"},
    {"slug": "ui-kits", "name": "UI Kits", "icon": "Layout"},
    {"slug": "mobile-ui", "name": "Mobile UI", "icon": "Smartphone"},
    {"slug": "desktop-setups", "name": "Desktop Setups", "icon": "Monitor"},
    {"slug": "fonts", "name": "Fonts", "icon": "Type"},
    {"slug": "templates", "name": "Templates", "icon": "LayoutTemplate"},
    {"slug": "sound-effects", "name": "Sound Effects", "icon": "Music"},
    {"slug": "game-assets", "name": "Game Assets", "icon": "Gamepad2"},
    {"slug": "3d-models", "name": "3D Models", "icon": "Box"},
    {"slug": "animations", "name": "Animations", "icon": "Film"},
]

@api.get("/categories")
async def get_categories():
    counts = {}
    async for doc in db.assets.aggregate([{"$group": {"_id": "$category", "count": {"$sum": 1}}}]):
        counts[doc["_id"]] = doc["count"]
    result = []
    for c in CATEGORIES:
        result.append({**c, "count": counts.get(c["slug"], 0)})
    return result

# --- Assets ---
async def enrich_asset(a: dict, current_user_id: Optional[str] = None) -> dict:
    creator = await db.users.find_one(
        {"user_id": a["creator_id"]},
        {"_id": 0, "password_hash": 0, "email": 0}
    )
    a["creator"] = creator or {"user_id": a["creator_id"], "name": "Unknown", "username": "unknown"}
    a["is_favorited"] = current_user_id in a.get("favorited_by", []) if current_user_id else False
    a.pop("_id", None)
    return a

@api.get("/assets")
async def list_assets(
    q: Optional[str] = None,
    category: Optional[str] = None,
    file_type: Optional[str] = None,
    sort: str = "new",
    limit: int = 60,
    creator_id: Optional[str] = None,
    request: Request = None,
):
    query = {}
    if category and category != "all":
        query["category"] = category
    if file_type and file_type != "all":
        query["file_type"] = file_type
    if creator_id:
        query["creator_id"] = creator_id
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"tags": {"$regex": q, "$options": "i"}},
            {"category": {"$regex": q, "$options": "i"}},
            {"original_filename": {"$regex": q, "$options": "i"}},
        ]
    sort_map = {
        "new": [("created_at", -1)],
        "downloads": [("downloads", -1)],
        "likes": [("likes", -1)],
        "views": [("views", -1)],
        "trending": [("views", -1), ("likes", -1)],
    }
    cursor = db.assets.find(query, {"_id": 0}).sort(sort_map.get(sort, sort_map["new"])).limit(limit)
    assets = await cursor.to_list(limit)
    current = await optional_user(request) if request else None
    cu = current["user_id"] if current else None
    return [await enrich_asset(a, cu) for a in assets]

@api.get("/assets/{asset_id}")
async def get_asset(asset_id: str, request: Request):
    asset = await db.assets.find_one({"asset_id": asset_id}, {"_id": 0})
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    await db.assets.update_one({"asset_id": asset_id}, {"$inc": {"views": 1}})
    asset["views"] = asset.get("views", 0) + 1
    current = await optional_user(request)
    cu = current["user_id"] if current else None
    return await enrich_asset(asset, cu)

@api.post("/assets")
async def create_asset(data: AssetCreate, user: dict = Depends(get_current_user)):
    asset_id = f"asset_{uuid.uuid4().hex[:12]}"
    doc = {
        "asset_id": asset_id,
        "creator_id": user["user_id"],
        **data.model_dump(),
        "downloads": 0,
        "likes": 0,
        "views": 0,
        "favorited_by": [],
        "created_at": now_utc(),
    }
    await db.assets.insert_one(doc)
    doc.pop("_id", None)
    return await enrich_asset(doc, user["user_id"])

@api.post("/assets/{asset_id}/favorite")
async def toggle_favorite(asset_id: str, user: dict = Depends(get_current_user)):
    asset = await db.assets.find_one({"asset_id": asset_id})
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    uid = user["user_id"]
    if uid in asset.get("favorited_by", []):
        await db.assets.update_one({"asset_id": asset_id}, {"$pull": {"favorited_by": uid}, "$inc": {"likes": -1}})
        return {"favorited": False}
    else:
        await db.assets.update_one({"asset_id": asset_id}, {"$addToSet": {"favorited_by": uid}, "$inc": {"likes": 1}})
        return {"favorited": True}

@api.post("/assets/{asset_id}/download")
async def track_download(asset_id: str):
    await db.assets.update_one({"asset_id": asset_id}, {"$inc": {"downloads": 1}})
    return {"ok": True}

@api.get("/assets/{asset_id}/file")
async def download_asset_file(asset_id: str):
    """Force-download the original file with proper Content-Disposition."""
    asset = await db.assets.find_one({"asset_id": asset_id}, {"_id": 0})
    if not asset or not asset.get("file_url"):
        raise HTTPException(status_code=404, detail="File not found")
    file_url = asset["file_url"]
    # Strip leading /uploads/ to get the storage filename
    if file_url.startswith("/uploads/"):
        filename = file_url[len("/uploads/"):]
    else:
        filename = Path(file_url).name
    filepath = UPLOAD_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File missing on disk")
    download_name = asset.get("original_filename") or asset.get("title") or filename
    # Increment download counter
    await db.assets.update_one({"asset_id": asset_id}, {"$inc": {"downloads": 1}})
    return FileResponse(
        path=str(filepath),
        filename=download_name,
        media_type=asset.get("mime_type") or "application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{download_name}"'},
    )

# --- Comments ---
@api.get("/assets/{asset_id}/comments")
async def list_comments(asset_id: str):
    cursor = db.comments.find({"asset_id": asset_id}, {"_id": 0}).sort("created_at", -1).limit(100)
    comments = await cursor.to_list(100)
    for c in comments:
        u = await db.users.find_one({"user_id": c["user_id"]}, {"_id": 0, "name": 1, "username": 1, "avatar": 1})
        c["user"] = u or {}
    return comments

@api.post("/assets/{asset_id}/comments")
async def add_comment(asset_id: str, data: CommentIn, user: dict = Depends(get_current_user)):
    doc = {
        "comment_id": f"c_{uuid.uuid4().hex[:10]}",
        "asset_id": asset_id,
        "user_id": user["user_id"],
        "text": data.text,
        "created_at": now_utc(),
    }
    await db.comments.insert_one(doc)
    doc.pop("_id", None)
    doc["user"] = {"name": user["name"], "username": user["username"], "avatar": user.get("avatar")}
    return doc

# --- Upload ---
@api.post("/upload")
async def upload_file(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    original_filename = file.filename or "file"
    ext = Path(original_filename).suffix.lower()
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = UPLOAD_DIR / filename
    with filepath.open("wb") as f:
        shutil.copyfileobj(file.file, f)
    size_bytes = filepath.stat().st_size
    mime_type = file.content_type or mimetypes.guess_type(original_filename)[0] or "application/octet-stream"
    file_type = detect_file_type(ext)
    return {
        "url": f"/uploads/{filename}",
        "storage_path": f"uploads/{filename}",
        "size": human_size(size_bytes),
        "size_bytes": size_bytes,
        "filename": filename,
        "original_filename": original_filename,
        "file_ext": ext,
        "mime_type": mime_type,
        "file_type": file_type,
    }

# --- Users / Creators ---
@api.get("/users/{username}")
async def get_creator(username: str):
    user = await db.users.find_one(
        {"username": username},
        {"_id": 0, "password_hash": 0, "email": 0}
    )
    if not user:
        raise HTTPException(status_code=404, detail="Creator not found")
    total_dl = 0
    total_likes = 0
    upload_count = 0
    async for a in db.assets.find({"creator_id": user["user_id"]}, {"downloads": 1, "likes": 1}):
        total_dl += a.get("downloads", 0)
        total_likes += a.get("likes", 0)
        upload_count += 1
    user["total_downloads"] = total_dl
    user["total_likes"] = total_likes
    user["uploads"] = upload_count
    user["followers_count"] = len(user.get("followers", []))
    return user

@api.patch("/users/me")
async def update_me(data: ProfileUpdate, user: dict = Depends(get_current_user)):
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if updates:
        await db.users.update_one({"user_id": user["user_id"]}, {"$set": updates})
    return {"ok": True}

@api.post("/users/{username}/follow")
async def follow(username: str, user: dict = Depends(get_current_user)):
    target = await db.users.find_one({"username": username})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target["user_id"] == user["user_id"]:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    if user["user_id"] in target.get("followers", []):
        await db.users.update_one({"user_id": target["user_id"]}, {"$pull": {"followers": user["user_id"]}})
        await db.users.update_one({"user_id": user["user_id"]}, {"$pull": {"following": target["user_id"]}})
        return {"following": False}
    else:
        await db.users.update_one({"user_id": target["user_id"]}, {"$addToSet": {"followers": user["user_id"]}})
        await db.users.update_one({"user_id": user["user_id"]}, {"$addToSet": {"following": target["user_id"]}})
        return {"following": True}

# --- Collections ---
@api.get("/collections")
async def list_collections(creator_id: Optional[str] = None):
    query = {"creator_id": creator_id} if creator_id else {}
    cursor = db.collections.find(query, {"_id": 0}).sort("created_at", -1).limit(50)
    cols = await cursor.to_list(50)
    for c in cols:
        u = await db.users.find_one({"user_id": c["creator_id"]}, {"_id": 0, "name": 1, "username": 1, "avatar": 1})
        c["creator"] = u or {}
    return cols

@api.post("/collections")
async def create_collection(data: CollectionIn, user: dict = Depends(get_current_user)):
    doc = {
        "collection_id": f"col_{uuid.uuid4().hex[:10]}",
        "creator_id": user["user_id"],
        **data.model_dump(),
        "created_at": now_utc(),
    }
    await db.collections.insert_one(doc)
    doc.pop("_id", None)
    return doc

# --- Leaderboards ---
@api.get("/leaderboards/creators")
async def top_creators(sort: str = "downloads", limit: int = 10):
    pipeline = [
        {"$group": {"_id": "$creator_id",
                    "total_downloads": {"$sum": "$downloads"},
                    "total_likes": {"$sum": "$likes"},
                    "uploads": {"$sum": 1}}},
        {"$sort": {"total_downloads" if sort == "downloads" else "total_likes": -1}},
        {"$limit": limit},
    ]
    top = await db.assets.aggregate(pipeline).to_list(limit)
    result = []
    for t in top:
        u = await db.users.find_one({"user_id": t["_id"]}, {"_id": 0, "password_hash": 0, "email": 0})
        if u:
            u["total_downloads"] = t["total_downloads"]
            u["total_likes"] = t["total_likes"]
            u["uploads"] = t["uploads"]
            result.append(u)
    return result

@api.get("/leaderboards/assets")
async def top_assets(sort: str = "downloads", limit: int = 10):
    sort_field = {"downloads": "downloads", "likes": "likes", "trending": "views", "new": "created_at"}.get(sort, "downloads")
    cursor = db.assets.find({}, {"_id": 0}).sort(sort_field, -1).limit(limit)
    assets = await cursor.to_list(limit)
    return [await enrich_asset(a, None) for a in assets]

# --- Dashboard ---
@api.get("/dashboard/stats")
async def dashboard_stats(user: dict = Depends(get_current_user)):
    total_dl = 0
    total_likes = 0
    total_views = 0
    uploads = 0
    async for a in db.assets.find({"creator_id": user["user_id"]}):
        total_dl += a.get("downloads", 0)
        total_likes += a.get("likes", 0)
        total_views += a.get("views", 0)
        uploads += 1
    favorites = await db.assets.count_documents({"favorited_by": user["user_id"]})
    return {"uploads": uploads, "downloads": total_dl, "likes": total_likes,
            "views": total_views, "favorites": favorites,
            "followers": len(user.get("followers", []))}

@api.get("/dashboard/favorites")
async def my_favorites(user: dict = Depends(get_current_user)):
    cursor = db.assets.find({"favorited_by": user["user_id"]}, {"_id": 0}).sort("created_at", -1).limit(100)
    assets = await cursor.to_list(100)
    return [await enrich_asset(a, user["user_id"]) for a in assets]

@api.get("/")
async def root():
    return {"service": "LazR Hub", "status": "online"}

app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Seeding ---
async def seed_data():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True)
    await db.assets.create_index("asset_id", unique=True)
    await db.assets.create_index([("title", "text"), ("description", "text"), ("tags", "text")])

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@lazrhub.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "user_id": "user_admin000000",
            "email": admin_email,
            "name": "LazR Admin",
            "username": "admin",
            "password_hash": hash_pw(admin_password),
            "avatar": "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=lazr",
            "banner": "",
            "bio": "Founder of LazR Hub",
            "verified": True,
            "followers": [], "following": [],
            "twitter": "lazrhub", "instagram": "", "website": "lazrhub.com",
            "created_at": now_utc(),
        })

    # NO demo creators or seed assets — real data only.
    # Purge legacy seed data if present from earlier runs.
    await db.users.delete_many({"user_id": {"$regex": "^user_(nova|kai|luma|orbit)"}})
    await db.assets.delete_many({"asset_id": {"$regex": "^asset_seed"}})

    if False:
        images = [
            "https://images.unsplash.com/photo-1687894986595-da703eb96375?w=800",
            "https://images.unsplash.com/photo-1718561193320-3e8638a838da?w=800",
            "https://images.unsplash.com/photo-1635614017406-7c192d832072?w=800",
            "https://images.unsplash.com/photo-1766342088246-5328f16fe9d0?w=800",
            "https://images.unsplash.com/photo-1704426882813-8acfff020487?w=800",
            "https://images.unsplash.com/photo-1637890454001-e6fcbd9247ea?w=800",
            "https://images.unsplash.com/photo-1780729995861-94f334dd55a9?w=800",
            "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=800",
            "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800",
            "https://images.unsplash.com/photo-1614851099175-e5b30eb6f696?w=800",
            "https://images.unsplash.com/photo-1633355444132-695d5876cd00?w=800",
            "https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=800",
        ]
        seeds = [
            ("Neon Grid Wallpaper", "wallpapers", ["neon", "grid", "cyberpunk"], "nova", 4321, 890, 12000),
            ("Holo Icon Pack", "icons", ["holo", "3d", "pack"], "kai", 2156, 645, 8900),
            ("Aurora UI Kit", "ui-kits", ["ui", "aurora", "figma"], "kai", 1890, 512, 7600),
            ("Cyber Mobile App UI", "mobile-ui", ["mobile", "cyber", "figma"], "orbit", 987, 234, 3400),
            ("Deep Space Desktop", "desktop-setups", ["desktop", "space", "4k"], "luma", 3456, 780, 11200),
            ("Quantum Sans Font", "fonts", ["sans", "display", "futuristic"], "nova", 1245, 388, 4900),
            ("Startup Landing Template", "templates", ["saas", "landing", "react"], "kai", 2789, 654, 9800),
            ("Cyber Whoosh FX", "sound-effects", ["sfx", "whoosh", "cyber"], "orbit", 743, 187, 2100),
            ("Neon Sword Game Asset", "game-assets", ["game", "sword", "3d"], "nova", 567, 143, 1800),
            ("Holographic Sphere 3D", "3d-models", ["3d", "sphere", "holo"], "luma", 1289, 356, 5600),
            ("Loading Ring Animation", "animations", ["animation", "loader", "svg"], "orbit", 892, 234, 3300),
            ("Purple Nebula Wallpaper", "wallpapers", ["wallpaper", "nebula", "purple"], "luma", 5670, 1200, 18400),
        ]
        for i, (title, cat, tags, creator, dl, lk, vw) in enumerate(seeds):
            await db.assets.insert_one({
                "asset_id": f"asset_seed{i:04d}",
                "creator_id": f"user_{creator}0000000",
                "title": title, "description": f"Premium {cat} — {title}. Perfect for your next project.",
                "category": cat, "tags": tags,
                "license": "Free" if i % 2 else "Pro",
                "preview_url": images[i],
                "gallery": [images[i], images[(i+1) % len(images)]],
                "file_url": "", "file_size": f"{(i+1)*2.4:.1f} MB", "version": "1.0.0",
                "downloads": dl, "likes": lk, "views": vw,
                "favorited_by": [], "created_at": now_utc(),
            })

    creds = """# LazR Hub — Test Credentials

## Admin Account
- Email: admin@lazrhub.com
- Password: admin123
- Username: admin
- Role: admin

## Auth Endpoints
- POST /api/auth/register  { email, password, name, username? }
- POST /api/auth/login     { email, password }
- POST /api/auth/logout
- GET  /api/auth/me
"""
    Path("/app/memory").mkdir(parents=True, exist_ok=True)
    Path("/app/memory/test_credentials.md").write_text(creds)

@app.on_event("startup")
async def startup():
    await seed_data()
    logger.info("LazR Hub API ready")

@app.on_event("shutdown")
async def shutdown():
    client.close()
