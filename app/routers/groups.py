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


# ========== MENSAJES DIRECTOS 1 A 1 (MODELO 2: WebSocket por conversación) ==========

@router.websocket("/dm/ws/{other_username}")
async def dm_websocket_endpoint(websocket: WebSocket, other_username: str):
    """
    WebSocket para chat 1 a 1 con un usuario específico.
    URL: ws://127.0.0.1:8000/groups/dm/ws/{username}?token=JWT
    """
    print(f"---- DM WebSocket attempt with {other_username} ----")

    token = websocket.query_params.get("token")
    
    if not token:
        print("NO TOKEN")
        await websocket.close(code=1008)
        return

    try:
        payload = verify_access_token(token)
        user_id = int(payload.get("sub"))
        print(f"USER ID: {user_id}")
    except Exception as e:
        print("TOKEN ERROR:", e)
        await websocket.close(code=1008)
        return

    db = SessionLocal()

    # Obtener usuario actual
    current_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not current_user:
        print("USER NOT FOUND")
        await websocket.close(code=1008)
        db.close()
        return

    # Obtener usuario con quien quiere chatear
    other_user = db.query(models.User).filter(models.User.username == other_username).first()
    if not other_user:
        print(f"OTHER USER '{other_username}' NOT FOUND")
        await websocket.close(code=1008)
        db.close()
        return

    # No permitir chat consigo mismo
    if current_user.id == other_user.id:
        print("CANNOT CHAT WITH YOURSELF")
        await websocket.close(code=1008)
        db.close()
        return

    await manager.connect_dm(current_user.id, other_user.id, websocket)
    print(f"DM CONNECTED: {current_user.username} <-> {other_user.username}")

    # Marcar mensajes previos como leídos
    db.query(models.DirectMessage).filter(
        models.DirectMessage.sender_id == other_user.id,
        models.DirectMessage.receiver_id == current_user.id,
        models.DirectMessage.is_read == False
    ).update({"is_read": True})
    db.commit()

    # Enviar mensaje de conexión
    connection_msg = f"[Sistema] {current_user.username} se conectó al chat"
    await manager.broadcast_dm(current_user.id, other_user.id, connection_msg)

    try:
        while True:
            data = await websocket.receive_text()
            print(f"DM MESSAGE: {current_user.username} -> {other_user.username}: {data}")

            # Guardar mensaje en BD
            dm = models.DirectMessage(
                content=data,
                sender_id=current_user.id,
                receiver_id=other_user.id
            )
            db.add(dm)
            db.commit()

            # Formatear y enviar a todos en la conversación
            formatted_msg = f"{current_user.username}: {data}"
            await manager.broadcast_dm(current_user.id, other_user.id, formatted_msg)

    except WebSocketDisconnect:
        print(f"DM DISCONNECTED: {current_user.username} <-> {other_user.username}")
        manager.disconnect_dm(current_user.id, other_user.id, websocket)
        
        # Mensaje de desconexión
        disconnect_msg = f"[Sistema] {current_user.username} se desconectó"
        await manager.broadcast_dm(current_user.id, other_user.id, disconnect_msg)
    except Exception as e:
        print(f"DM ERROR: {e}")
        manager.disconnect_dm(current_user.id, other_user.id, websocket)
    finally:
        db.close()


@router.get("/dm/history/{username}", response_model=list[schemas.DirectMessageResponse])
def get_dm_history(
    username: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Obtener historial completo de mensajes con un usuario específico"""
    
    other_user = db.query(models.User).filter(
        models.User.username == username
    ).first()
    
    if not other_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    messages = db.query(models.DirectMessage).filter(
        ((models.DirectMessage.sender_id == current_user.id) & 
         (models.DirectMessage.receiver_id == other_user.id)) |
        ((models.DirectMessage.sender_id == other_user.id) & 
         (models.DirectMessage.receiver_id == current_user.id))
    ).order_by(models.DirectMessage.created_at).all()
    
    return messages


@router.get("/dm/unread", response_model=list[schemas.DirectMessageResponse])
def get_unread_messages(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Obtener todos los mensajes no leídos"""
    
    unread = db.query(models.DirectMessage).filter(
        models.DirectMessage.receiver_id == current_user.id,
        models.DirectMessage.is_read == False
    ).order_by(models.DirectMessage.created_at).all()
    
    return unread


@router.post("/dm/mark-read/{username}")
def mark_messages_as_read(
    username: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Marcar todos los mensajes de un usuario como leídos"""
    
    other_user = db.query(models.User).filter(
        models.User.username == username
    ).first()
    
    if not other_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    updated = db.query(models.DirectMessage).filter(
        models.DirectMessage.sender_id == other_user.id,
        models.DirectMessage.receiver_id == current_user.id,
        models.DirectMessage.is_read == False
    ).update({"is_read": True})
    
    db.commit()
    
    return {"message": f"{updated} mensajes marcados como leídos"}