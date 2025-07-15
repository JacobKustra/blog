from pydantic import BaseModel

class BlogPost(BaseModel):
    id: int | None = None  # Allow id to be optional for POST requests
    title: str
    content: str
    author: str
