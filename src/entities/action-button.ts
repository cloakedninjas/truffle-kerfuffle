import { Scene } from 'phaser';
import { Button } from "./button";
import { UI_DEPTH, UI_PADDING } from "../config";
import { Action } from "../lib/types";

export class ActionButton extends Button {
    action: Action;

    frameLookup: Record<Action, number> = {
        'dig': 0,
        'sniff': 1,
        'hide': 2,
        'reveal': 3,
        'deposit': 4
    }

    constructor(scene: Scene) {
        super(scene, 'contextual');
        this.setPosition(1024 - UI_PADDING, 768 - UI_PADDING);
        this.setOrigin(1, 1);
        this.setDepth(UI_DEPTH);
        this.visible = false;

        scene.add.existing(this);
    }

    setAction(action: Action) {
        if (this.action === action) {
            return;
        }

        this.action = action;

        if (action) {
            this.setFrame(this.frameLookup[action]);
            this.visible = true;
        } else {
            this.visible = false;
        }
    }
}
