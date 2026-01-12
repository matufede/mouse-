export enum MouseAction {
  LEFT_CLICK = 'LEFT_CLICK',
  RIGHT_CLICK = 'RIGHT_CLICK',
  DOUBLE_CLICK = 'DOUBLE_CLICK',
  DRAG = 'DRAG',
  MOVE = 'MOVE',
  SCROLL = 'SCROLL'
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  UP_LEFT = 'UP_LEFT',
  UP_RIGHT = 'UP_RIGHT',
  DOWN_LEFT = 'DOWN_LEFT',
  DOWN_RIGHT = 'DOWN_RIGHT',
  CENTER = 'CENTER' // Used for center action
}

export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED'
}

export enum AppMode {
  LANDING = 'LANDING',
  SCANNING = 'SCANNING',
  CONTROLLER = 'CONTROLLER',
  RECEIVER = 'RECEIVER'
}

export enum SensitivityMode {
  PRECISION = 'PRECISION',
  NAVIGATION = 'NAVIGATION'
}

export interface RemoteMessage {
  type: 'MOVE' | 'ACTION' | 'ADVERTISE' | 'CONNECT';
  payload: any;
  roomId: string;
}

export interface DeviceInfo {
  id: string;
  name: string;
  lastSeen: number;
}