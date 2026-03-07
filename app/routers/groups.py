from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.oauth2 import get_current_user
from fastapi import HTTPException
from fastapi import WebSocket, WebSocketDisconnect
from app.websocket_manager import ConnectionManager
from app.oauth2 import verify_access_token
from app.database import SessionLocal
router = APIRouter(
    prefix="/groups",
    tags=["Groups"]
)


@router.post("/", response_model=schemas.GroupResponse)
def create_group(
    group: schemas.GroupCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_group = models.Group(
        name=group.name,
        description=group.description,
        owner_id=current_user.id
    )

    db.add(new_group)
    db.commit()
    db.refresh(new_group)

    return new_group

@router.post("/{group_id}/join")
def join_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    existing = db.query(models.GroupMember).filter_by(
        user_id=current_user.id,
        group_id=group_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already a member")

    membership = models.GroupMember(
        user_id=current_user.id,
        group_id=group_id
    )

    db.add(membership)
    db.commit()

    return {"message": "Joined group successfully"}

manager = ConnectionManager()

@router.websocket("/ws/{group_id}")
async def websocket_endpoint(websocket: WebSocket, group_id: int):

    print("---- WebSocket attempt ----")

    token = websocket.query_params.get("token")
    print("TOKEN:", token)

    if not token:
        print("NO TOKEN")
        await websocket.close(code=1008)
        return

    try:
        payload = verify_access_token(token)
        print("PAYLOAD:", payload)
        user_id = int(payload.get("sub"))
        print("USER ID:", user_id)
    except Exception as e:
        print("TOKEN ERROR:", e)
        await websocket.close(code=1008)
        return

    db = SessionLocal()

    membership = db.query(models.GroupMember).filter_by(
        user_id=user_id,
        group_id=group_id
    ).first()

    print("MEMBERSHIP:", membership)

    if not membership:
        print("NOT A MEMBER")
        await websocket.close(code=1008)
        return

    await manager.connect(group_id, websocket)
    print("CONNECTED SUCCESSFULLY")

    try:
        while True:
            data = await websocket.receive_text()
            print("MESSAGE RECEIVED:", data)

            message = models.Message(
                content=data,
                user_id=user_id,
                group_id=group_id
            )

            db.add(message)
            db.commit()

            await manager.broadcast(group_id, data)

    except WebSocketDisconnect:
        print("DISCONNECTED")
        manager.disconnect(group_id, websocket)

@router.get("/{group_id}/messages")
def get_group_messages(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    messages = db.query(models.Message).filter(
        models.Message.group_id == group_id
    ).order_by(models.Message.id).all()

    return messages

@router.get("/my-groups")
def get_my_groups(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    groups = (
        db.query(models.Group)
        .join(models.GroupMember, models.Group.id == models.GroupMember.group_id)
        .filter(models.GroupMember.user_id == current_user.id)
        .all()
    )

    return groups