from pydantic import BaseModel, EmailStr, field_validator


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    nickname: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError("Пароль должен содержать минимум 6 символов")
        return v

    @field_validator("nickname")
    @classmethod
    def nickname_length(cls, v):
        if len(v.strip()) < 2:
            raise ValueError("Никнейм слишком короткий")
        return v.strip()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: int
    email: str
    nickname: str

    model_config = {"from_attributes": True}

class RefreshRequest(BaseModel):
    refresh_token: str


TokenResponse.model_rebuild()
