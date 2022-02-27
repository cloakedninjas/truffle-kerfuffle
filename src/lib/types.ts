import { TruffleSpawner } from "../entities/truffle-spawner";

export type Direction = 'n' | 's' | 'e' | 'w';
export type Action = 'sniff' | 'dig' | 'deposit' | 'hide' | 'reveal';
export type FoxBehaviour = 'patrolling' | 'chasing';

export const INTERACTIVE = {
    cursor: 'pointer'
};

export interface TruffleDistance {
    truffle: TruffleSpawner;
    distance: number;
}

export interface MoveLocation {
    coord: Phaser.Types.Math.Vector2Like,
    dist: number
}

export interface ScoreParams {
    trufflesCollected: number;
    time: number
}
