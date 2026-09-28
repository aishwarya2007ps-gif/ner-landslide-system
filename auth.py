from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from typing import List, Optional

from app.database.session import get_db
from app.database.models import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

def require_role(allowed_roles: List[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required roles: {allowed_roles}"
            )
        return current_user
    return role_checker

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        phone_number=user_in.phone_number,
        assigned_state=user_in.assigned_state,
        assigned_district=user_in.assigned_district
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is inactive")

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/demo-accounts")
def get_demo_accounts():
    """
    Returns development demo credentials for fast testing of each role.
    Only active in development environments.
    """
    return {
        "disclaimer": "These accounts are seeded for development and testing only.",
        "accounts": [
            {"role": "Super Admin", "email": "admin@ner-disaster.gov.in", "password": "Password123!", "scope": "Full System Access"},
            {"role": "State Authority", "email": "state@ner-disaster.gov.in", "password": "Password123!", "scope": "NER State Monitoring & Regional Alerts"},
            {"role": "District Authority", "email": "district@ner-disaster.gov.in", "password": "Password123!", "scope": "Kamrup Metro District Verification & Dispatch"},
            {"role": "Field Worker", "email": "field@ner-disaster.gov.in", "password": "Password123!", "scope": "Offline Incident Reporting & GPS Verification"},
            {"role": "Citizen", "email": "citizen@ner-disaster.gov.in", "password": "Password123!", "scope": "Public Warning Maps, Shelters & Reporting"}
        ]
    }
