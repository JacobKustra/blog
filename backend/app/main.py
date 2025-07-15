from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .models import BlogPost
from typing import List
import os
from dotenv import load_dotenv


# Load .env file from the backend directory (one level up)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    logger.error("DATABASE_URL not found in .env file")
    raise ValueError("DATABASE_URL must be set in .env file")



engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class BlogPostDB(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(String)
    author = Column(String)

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Hello, World!"} 

@app.post("/posts/", response_model=BlogPost)
def create_post(post: BlogPost, db: SessionLocal = Depends(get_db)):
    db_post = BlogPostDB(**post.dict(exclude_unset=True))
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return post

@app.get("/posts/", response_model=List[BlogPost])
def read_posts(db: SessionLocal = Depends(get_db)):
    return db.query(BlogPostDB).all()



@app.get("/posts/{post_id}", response_model=BlogPost)
def read_post(post_id: int, db: SessionLocal = Depends(get_db)):
    post = db.query(BlogPostDB).filter(BlogPostDB.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return post




@app.put("/posts/{post_id}", response_model=BlogPost)
def update_post(post_id: int, updated_post: BlogPost, db: SessionLocal = Depends(get_db)):
    post = db.query(BlogPostDB).all()
    db_post = db.query(BlogPostDB).filter(BlogPostDB.id == post_id).first()
    db_post.title = updated_post.title
    db_post.content = updated_post.content
    db_post.author = updated_post.author
    db.commit()
    return updated_post

@app.delete("/posts/{post_id}")
def delete_post(post_id: int, db: SessionLocal = Depends(get_db)):
    post = db.query(BlogPostDB).all()
    db_post = db.query(BlogPostDB).filter(BlogPostDB.id == post_id).first()
    db.delete(db_post)
    db.commit()
    return {"message": "Post deleted"}













