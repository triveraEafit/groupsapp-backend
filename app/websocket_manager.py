from fastapi import WebSocket
from typing import Dict, List, Tuple

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}
        # Para DMs: clave = tuple(user1_id, user2_id) ordenado, valor = lista de websockets
        self.dm_connections: Dict[Tuple[int, int], List[WebSocket]] = {}

    async def connect(self, group_id: int, websocket: WebSocket):
        await websocket.accept()
        if group_id not in self.active_connections:
            self.active_connections[group_id] = []
        self.active_connections[group_id].append(websocket)

    def disconnect(self, group_id: int, websocket: WebSocket):
        self.active_connections[group_id].remove(websocket)

    async def broadcast(self, group_id: int, message: str):
        for connection in self.active_connections.get(group_id, []):
            await connection.send_text(message)
    
    def _get_dm_key(self, user1_id: int, user2_id: int) -> Tuple[int, int]:
        """Genera una clave ordenada para la conversación entre dos usuarios"""
        return tuple(sorted([user1_id, user2_id]))
    
    async def connect_dm(self, user1_id: int, user2_id: int, websocket: WebSocket):
        """Conectar a una conversación DM específica"""
        await websocket.accept()
        key = self._get_dm_key(user1_id, user2_id)
        if key not in self.dm_connections:
            self.dm_connections[key] = []
        self.dm_connections[key].append(websocket)
    
    def disconnect_dm(self, user1_id: int, user2_id: int, websocket: WebSocket):
        """Desconectar de una conversación DM"""
        key = self._get_dm_key(user1_id, user2_id)
        if key in self.dm_connections:
            self.dm_connections[key].remove(websocket)
            if not self.dm_connections[key]:
                del self.dm_connections[key]
    
    async def broadcast_dm(self, user1_id: int, user2_id: int, message: str):
        """Enviar mensaje a todos los conectados en esa conversación DM"""
        key = self._get_dm_key(user1_id, user2_id)
        for connection in self.dm_connections.get(key, []):
            await connection.send_text(message)