from pydantic import BaseModel

class BlogPost(BaseModel):
    id: int | None = None
    title: str
    content: str
    author: str

class BlogPostCreate(BaseModel):
    title: str
    content: str

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str
