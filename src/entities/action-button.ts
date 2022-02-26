import { Scene } from 'phaser';
import { Button } from "./button";
import { UI_PADDING } from "../config";
import { Action } from "../lib/types";
import GameObject = Phaser.GameObjects.GameObject;

export class ActionButton extends Button {
    action: Action;
    activeObject: Phaser.GameObjects.GameObject;

    constructor(scene: Scene) {
        super(scene, 'action_button');
        this.setPosition(1024 - UI_PADDING, 768 - UI_PADDING);
        this.setOrigin(1, 1);
        this.visible = false;

        scene.add.existing(this);
    }

    setAction(action: Action, gameObject?: GameObject) {
        this.action = action;
        this.activeObject = gameObject;

        if (action) {
            this.setTexture(action);
            this.visible = true;
        } else {
            this.visible = false;
        }
    }
}
