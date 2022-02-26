import { TruffleSpawner } from "../entities/truffle-spawner";

export type Direction = 'n' | 's' | 'e' | 'w';

export type Action = 'sniff' | 'dig' | 'deposit' | 'hide' | 'reveal';

export const INTERACTIVE = {
    cursor: 'pointer'
};

export interface TruffleDistance {
    truffle: TruffleSpawner;
    distance: number;
}
