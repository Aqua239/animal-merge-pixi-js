import { Assets, Container, Graphics, Rectangle, Sprite, Text, Texture } from "pixi.js";
import BaseScreen from "./baseScreen";
import { ANIMAL_LEVEL, GAME_CONFIG } from "../constant";
import { BaseButton } from "../UI/baseButton";
import { IconButton, IconCircleButton } from "../UI/button";

export default class GameScreen extends BaseScreen {
    constructor({onSetting}) {
        super(GAME_CONFIG.BACKGROUND_COLOR);

        this.currentScoreText = null;
        this.highScoreText = null;
        this.coinText = null;
        this.onSetting = onSetting;

        this.removeItemButton = null;
        this.onRemoveItemClick = null;

        this.mergeTreeAnimals = [];
        this.mergeTreeArrows = [];

        this.drawBoundaries();
        this.drawNextAnimalBackground();
        this.drawScores();
        this.drawCountdown();
        this.drawSettingsButton();
        this.drawShopPanel()
        this.drawMergeTree();

        this.hideCountdown();
    }

    drawBoundaries() {
        const marginX = 0;
        const floorThickness = 15;
        const floorColor = GAME_CONFIG.FOREGROUND_COLOR;
        const floor = new Graphics();
        floor.rect(
            marginX,
            GAME_CONFIG.FLOOR_Y,
            GAME_CONFIG.GAME_AREA_WIDTH,
            floorThickness
        ).fill(floorColor);

        const dashLine = new Graphics();
        const dangerDashLength = 30;
        const dangerDashGap = 15;

        for(let i = marginX; i < GAME_CONFIG.GAME_AREA_WIDTH - marginX; i +=dangerDashLength) {
            dashLine.moveTo(i, GAME_CONFIG.CEILING_Y)
                    .lineTo(i + dangerDashGap, GAME_CONFIG.CEILING_Y)
                    .stroke({width: 6, color: GAME_CONFIG.FOREGROUND_COLOR});
        }

        this.container.addChild(floor);
        this.container.addChild(dashLine);
    };

    drawNextAnimalBackground() {
        const radius = GAME_CONFIG.NEXT_ANIMAL_RADIUS;
        const backgroundCircle = new Graphics();

        backgroundCircle.circle(
            GAME_CONFIG.NEXT_ANIMAL_POSITION_X,
            GAME_CONFIG.NEXT_ANIMAL_POSITION_Y,
            radius
        // ).fill(GAME_CONFIG.FOREGROUND_COLOR);
        );
        backgroundCircle.stroke({width: 10, color: 0xC4BCB0});

        this.container.addChild(backgroundCircle);
    };

    drawScores() {
        const screenCenterX = GAME_CONFIG.SCREEN_WIDTH / 2;
        const scoreStyle = {fontFamily: GAME_CONFIG.FONT_FAMILY, fontSize: 50, fill: GAME_CONFIG.TEXT_COLOR, fontWeight: 'bold'};
        const labelStyle = {fontFamily: GAME_CONFIG.FONT_FAMILY, fontSize: 50, fill: GAME_CONFIG.TEXT_COLOR, fontWeight: 'bold'};

        //High Score
        this.highScoreContainer = new Container();

        const highScoreLabel = new Text({text: 'BEST', style: labelStyle});
        highScoreLabel.x = 0;
        highScoreLabel.y = 0;

        this.highScoreText = new Text({text: '9999', style: scoreStyle});
        this.highScoreText.x = highScoreLabel.width + 20;
        this.highScoreText.y = 0;

        this.highScoreContainer.addChild(highScoreLabel, this.highScoreText);
        this.highScoreContainer.x = screenCenterX - (this.highScoreContainer.width / 2);
        this.highScoreContainer.y = 150 - scoreStyle.fontSize;

        //Current Score
        this.currentScoreContainer = new Container();

        const currentScoreLabel = new Text({text: 'SCORE', style: labelStyle});
        currentScoreLabel.x = 0;
        currentScoreLabel.y = 0;

        this.currentScoreText = new Text({text: '0', style: scoreStyle});
        this.currentScoreText.x = currentScoreLabel.width + 20;
        this.currentScoreText.y = 0;

        this.currentScoreContainer.addChild(currentScoreLabel, this.currentScoreText);
        this.currentScoreContainer.x = screenCenterX - (this.currentScoreContainer.width / 2);
        this.currentScoreContainer.y = 150;

        this.container.addChild(this.highScoreContainer, this.currentScoreContainer);
    };

    updateCurrentScore(newScore) {
        this.currentScoreText.text = newScore.toString();

        const screenCenterX = GAME_CONFIG.SCREEN_WIDTH / 2;
        this.currentScoreContainer.x = screenCenterX - (this.currentScoreContainer.width / 2);
    }

    updateHighScore(newHighScore) {
        this.highScoreText.text = newHighScore.toString();

        const screenCenterX = GAME_CONFIG.SCREEN_WIDTH / 2;
        this.highScoreContainer.x = screenCenterX - (this.highScoreContainer.width / 2);
    }

    drawCountdown(){
        const countdownStyle = {fontFamily: GAME_CONFIG.FONT_FAMILY, fontSize: 250, fill: GAME_CONFIG.TEXT_COLOR, fontWeight: 'bold'};
        this.countdownContainer = new Container();

        this.countdownText = new Text({text: '5', style: countdownStyle});
        this.countdownText.x = 0;
        this.countdownText.y = 0;

        this.countdownContainer.addChild(this.countdownText);
        this.countdownContainer.x = (GAME_CONFIG.SCREEN_WIDTH / 2) - (this.countdownContainer.width / 2);
        this.countdownContainer.y = 190;
        this.container.addChild(this.countdownContainer);
    }

    updateCountdown(countdown){
        this.countdownText.text = countdown.toString();
    }

    showCountdown(){
        this.countdownText.visible = true;
    }

    hideCountdown(){
        this.countdownText.visible = false;
    }

    drawSettingsButton() {
        const settingButton = new BaseButton({
            textureName: "button_setting",
            x: 950,
            y: 150,
            width: 100,
            height: 100,
            onClick: this.onSetting
        })
        this.container.addChild(settingButton);
    };

    drawShopPanel() {
        const shopPanelContainer = new Container();
        shopPanelContainer.x = 50;
        shopPanelContainer.y = 100;

        this.drawCoinDisplay(shopPanelContainer);
        this.drawItemDisplay(shopPanelContainer);

        this.container.addChild(shopPanelContainer);
    }

    drawCoinDisplay(parentContainer) {
        const coinContainer = new Container();

        const coinIcon = Sprite.from("icon_coin");
        coinIcon.anchor.set(0, 0.5);
        coinIcon.width = 50;
        coinIcon.height = 50;
        coinIcon.x = 0;
        coinIcon.y = coinIcon.height / 2;

        this.coinText = new Text({
            text: '0',
            style: {
                fontFamily: GAME_CONFIG.FONT_FAMILY,
                fontSize: 50,
                fill: GAME_CONFIG.TEXT_COLOR,
                fontWeight: 'bold'
            }
        });
        this.coinText.anchor.set(0, 0.5);
        this.coinText.x = coinIcon.x + (coinIcon.width * 1.5);
        this.coinText.y = coinIcon.y;

        coinContainer.addChild(coinIcon, this.coinText);
        parentContainer.addChild(coinContainer);
    }

    drawItemDisplay(parentContainer) {
        const boxItemContainer = new Container();
        boxItemContainer.x = 50;
        boxItemContainer.y = 125;

        const removeItemContainer = new Container();
        removeItemContainer.x = 0;
        removeItemContainer.y = 0;

        this.removeItemButton = new IconCircleButton({
            textureName: "button_circle",
            x: 0, y: 0,
            width: 100, height: 100,
            radius: 50,
            iconName: "icon_x",
            onClick: () => {
                if (this.onRemoveItemClick) {
                    this.onRemoveItemClick();
                }
            }
        });

        const removePriceDisplay =this.createItemPriceDisplay(0);
        this.removeItemPriceText = removePriceDisplay.priceText;
        this.removeItemPriceIcon = removePriceDisplay.priceIcon;
        removePriceDisplay.container.x = -removePriceDisplay.container.width / 2;
        removePriceDisplay.container.y = this.removeItemButton.height / 2 + 25;
        removeItemContainer.addChild(this.removeItemButton, removePriceDisplay.container);


        const mixItemContainer = new Container();
        mixItemContainer.x = 130;
        mixItemContainer.y = 0;

        this.mixItemButton = new IconCircleButton({
            textureName: "button_circle",
            x: 0, y: 0,
            width: 100, height: 100,
            radius: 50,
            iconName: "icon_mix",
            onClick: () => {
                if(this.onMixItemClick){
                    this.onMixItemClick();
                }
            }
        })

        const mixPriceDisplay = this.createItemPriceDisplay(0);
        this.mixItemPriceText = mixPriceDisplay.priceText;
        this.mixItemPriceIcon = mixPriceDisplay.priceIcon;
        mixPriceDisplay.container.x = -mixPriceDisplay.container.width / 2;
        mixPriceDisplay.container.y = this.mixItemButton.height / 2 + 25;
        mixItemContainer.addChild(this.mixItemButton, mixPriceDisplay.container)

        boxItemContainer.addChild(removeItemContainer, mixItemContainer);
        parentContainer.addChild(boxItemContainer);
    }

    createItemPriceDisplay(price) {
        const priceContainer = new Container();
        const priceText = new Text({
            text: price.toString(),
            style: {
                fontFamily: GAME_CONFIG.FONT_FAMILY,
                fontSize: 30,
                fill: GAME_CONFIG.TEXT_COLOR,
                fontWeight: "bold"
            }
        });

        priceText.anchor.set(0, 0.5);
        priceText.x = 0;
        priceText.y = 0;

        const priceIcon = Sprite.from("icon_coin");
        priceIcon.anchor.set(0, 0.5);
        priceIcon.x = priceText.width + 5;
        priceIcon.y = 0;
        priceIcon.width = 30;
        priceIcon.height = 30;

        priceContainer.addChild(priceText, priceIcon);

        return {container: priceContainer, priceText, priceIcon};
    }

    updateItemPrice(itemType, price) {
        let priceText = null;
        let priceIcon = null;

        switch (itemType) {
            case "remove":
                priceText = this.removeItemPriceText;
                priceIcon = this.removeItemPriceIcon;
                break;

            case "mix":
                priceText = this.mixItemPriceText;
                priceIcon = this.mixItemPriceIcon;
                break;

            default:
                return;
        }

        if (!priceText || !priceIcon) return;

        priceText.text = price.toString();
        priceIcon.x = priceText.width + 5;
    }

    updateCoin(newCoinAmount) {
        if (this.coinText) {
            this.coinText.text = newCoinAmount.toString();
        }
    }

    drawMergeTree(){
        const boxWidth = GAME_CONFIG.GAME_AREA_WIDTH;
        const boxHeight = 1920 - GAME_CONFIG.FLOOR_Y;
        const totalLevel = Object.keys(ANIMAL_LEVEL).length;
        const boxContainer = this.createMergeTreeBox(boxWidth,boxHeight);

        const animalTree = new Container();
        const paddingX = 20;
        const availableWidth = boxWidth - paddingX * 2;

        animalTree.x = paddingX;
        animalTree.y = boxHeight / 2;

        this.mergeTreeAnimals = [];
        this.mergeTreeArrows = [];
        const layout = this.calculateMergeTreeLayout(totalLevel, availableWidth);
        let currentX = 0;

        for(let i = 0; i < totalLevel; i++){
            const level = i + 1;
            const displaySize = layout.animalSizes[i];
            const animal = this.createMergeTreeAnimal(level, displaySize, currentX);

            this.mergeTreeAnimals.push(animal);
            animalTree.addChild(animal);
            currentX += displaySize;

            if(i < totalLevel - 1){
                currentX += layout.fixedGap;
                const arrow = this.createMergeTreeArrow(level, currentX, layout.arrowWidth);

                this.mergeTreeArrows.push(arrow);
                animalTree.addChild(arrow);

                currentX += layout.arrowWidth;
                currentX += layout.fixedGap;
            }
        }

        boxContainer.addChild(animalTree);
        this.container.addChild(boxContainer);
    }

    updateMergeTreeHighestLevel(highestLevel){
        for(const animal of this.mergeTreeAnimals){
            animal.alpha = animal.level <= highestLevel ? 1 : 0.5;
        }
        console.log(this.mergeTreeArrows);


        for(const arrow of this.mergeTreeArrows){
            arrow.alpha = arrow.toLevel <= highestLevel ? 1 : 0.5;
            console.log(arrow.toLevel);
        }
    }

    createMergeTreeBox(boxWidth, boxHeight){
        const boxContainer = new Container();
        boxContainer.x = 0;
        boxContainer.y = GAME_CONFIG.FLOOR_Y;

        const box = new Graphics();
        box.rect(0, 0, boxWidth, boxHeight).fill(GAME_CONFIG.FOREGROUND_COLOR);
        boxContainer.addChild(box);

        return boxContainer;
    }

    calculateMergeTreeLayout(totalLevel, availableWidth){
        const animalSizes = [];

        for(let i = 0; i < totalLevel; i++){
            const desiredSize = 38 + i * 5;
            animalSizes.push(desiredSize);
        }

        const totalAnimalWidth = animalSizes.reduce((total, size) => total + size, 0);
        const arrowWidth = 20;
        const totalArrowWidth = arrowWidth * (totalLevel - 1);

        const fixedGap = Math.max(
            4,
            (availableWidth - totalAnimalWidth - totalArrowWidth) / ((totalLevel - 1) * 2)
        );

        return {animalSizes, arrowWidth, fixedGap};
    }

    createMergeTreeAnimal(level, displaySize, currentX){
        const config = ANIMAL_LEVEL[level];
        const baseTexture = Assets.get(config.textureName);

        const frame = new Rectangle(
            config.xSprite,
            config.ySprite,
            config.widthSprite,
            config.heightSprite
        );

        const texture = new Texture({
            source: baseTexture.source,
            frame: frame,
        });

        const animal = new Sprite(texture);
        animal.anchor.set(0.5);
        animal.width = displaySize;
        animal.height = displaySize;
        animal.x = currentX + displaySize / 2;
        animal.y = 0;
        animal.level = level;
        animal.alpha = 0.5;

        return animal;
    }

    createMergeTreeArrow(level, currentX, arrowWidth){
        const arrow = new Text({
            text: ">",
            style: {
                fontFamily: GAME_CONFIG.FONT_FAMILY,
                fontSize: 22,
                fill: 0xffffff,
                fontWeight: "bold",
            },
        });

        arrow.anchor.set(0.5);
        arrow.x = currentX + arrowWidth / 2;
        arrow.y = 0;
        arrow.fromLevel = level;
        arrow.toLevel = level + 1;
        arrow.alpha = 0.5;

        return arrow;
    }

    setRemoveItemClickHandler(callback) {
        this.onRemoveItemClick = callback;
    }
}

