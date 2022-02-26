import { Scene } from 'phaser';
import { Button } from "./button";
import { UI_PADDING } from "../config";
import { Action } from "../lib/types";

export class ActionButton extends Button {
    private action: Action;

    constructor(scene: Scene) {
        super(scene, 'action_button');
        this.setPosition(1024 - UI_PADDING, 768 - UI_PADDING);
        this.setOrigin(1, 1);
        this.visible = false;
        scene.add.existing(this);
    }

    setAction(action: Action) {
        this.action = action;

        if (action) {
            //this.setTexture(action);
            this.visible = true;
        } else {
            this.visible = false;
        }

    }
}
