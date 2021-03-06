import Phaser from "phaser";
import { setupListeners } from '../services';
import GameConfig from '../GameConfig';
import { ITile, IDirection, ISwipeCriteria, IMoveKey } from '../interfaces';

export default class playGame extends Phaser.Scene {

  boardArray:Array<ITile[]>;
  canMove:boolean;

  cursorKeys:Array<string>;
  direction:IDirection;
  moveKeys:Array<string>;
  gameKeys:Array<IMoveKey>;
  // cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super("PlayGame");
    this.boardArray = [];
    this.canMove = false;
    // debugger;
    this.direction = GameConfig.direction;
    this.cursorKeys = [];
    this.moveKeys = GameConfig.moveKeys;
    this.gameKeys = GameConfig.gameKeys;
  }
  
  create() {
    setupListeners(this); // this is reference to current Scene `playGame
    // this.cursorKeys = Object.keys(this.input.keyboard.createCursorKeys());
    const { rows, cols } = GameConfig.board;
    
    for ( let row = 0; row < rows; row++) {
      this.boardArray[row] = [];
      for (let col = 0; col < cols; col++) {
        const { x, y } = this.getTilePosition(row, col);
        const tile = this.add.sprite(x, y, 'tiles', 0);
        tile.visible = false; // Hide all tiles
        this.boardArray[row][col] = {
          width: 200,
          height: 200,
          value: 0,
          front: tile,
          back: tile,
        };
      }
    }
    this.addTile();
    this.addTile();
    this.input.keyboard.on('keydown', this.handleKey, this);
    this.input.on('pointerup', this.handleSwipe, this);
  }

  addTile() {
    const emptyTiles = [];
    for (let row = 0; row < GameConfig.board.rows; row++) {
      for (let col = 0; col < GameConfig.board.cols; col++) {
        if (this.boardArray[row][col].value === 0) {
          emptyTiles.push({
            row,
            col,
          });
        }
        
      }
      
    }
    if (emptyTiles.length > 0) {
      const chosenTile = Phaser.Utils.Array.GetRandom(emptyTiles);
      const { row, col } = chosenTile;
      const tile:ITile = this.boardArray[chosenTile.row][chosenTile.col];
        tile.value = 1;
        tile.front.visible = true;
        tile.front.setFrame(0);
        tile.front.alpha = 0;
        this.tweens.add({
          targets: [tile.front],
          alpha: 1,
          duration: GameConfig.gamePlayConfig.tweenSpeed,
          callbackScope: this,
          onComplete: () => {
            this.canMove = true;
          }
        });
    }
  }

  getTilePosition(row: number, col: number): Phaser.Geom.Point {
    const { width, height} = GameConfig.tile;
    const { spacing } = GameConfig.board;
    const posX = spacing * (col + 1) + width * (col + 0.5);
    const posY = spacing * (row + 1) + height * (row + 0.5);

    return new Phaser.Geom.Point(posX, posY);
  }

  handleKey(event:KeyboardEvent) {
    const {code:keyPressed} = event; // ES!example##destructuring##object##alias
    if (keyPressed) {
      if (!this.moveKeys.includes(keyPressed)) return;
    }
    
    const {RIGHT, LEFT, UP, DOWN} = this.direction;

    if (this.canMove) {
      switch (keyPressed) {
        // move Right
        case "KeyD":
        case "ArrowRight":
          this.move(RIGHT);
          break;
        // move Left
        case "KeyA":
        case "ArrowLeft":
          this.move(LEFT);
          break;
        // move Up
        case "KeyW":
        case "ArrowUp":
          this.move(UP);
          break;
        // move Left
        case "KeyS":
        case "ArrowDown":
          this.move(DOWN);
          break;
      
        default:
          break;
      }
    }
  }
  move(direction: number) {
    console.log(`move ${direction}`);
  }
  
  handleSwipe(event:Phaser.Input.Pointer) {
    const {upTime, downTime, upX, downX, upY, downY} = event;
    const {RIGHT, LEFT, UP, DOWN} = this.direction;
    const {swipeMinNormal:min, swipeMaxTime:maxTime, swipeMinDistance:minDist} = GameConfig.swipeCriteria;
    const swipeTime:number = upTime - downTime;
    const fastEnough:boolean = swipeTime < maxTime;
    const swipe:Phaser.Geom.Point
      = new Phaser.Geom.Point(upX - downX, upY - downY);
    const swipeMagnitude = Phaser.Geom.Point.GetMagnitude(swipe);
    const longEnough:boolean = swipeMagnitude > minDist;

    if (longEnough && fastEnough) {
      Phaser.Geom.Point.SetMagnitude(swipe, 1);
      if (swipe.x > min) this.move(RIGHT);
      if (swipe.x < -min) this.move(LEFT);
      if (swipe.y > min) this.move (DOWN);
      if (swipe.y < -min) this.move (UP);
    }
      
    // console.log(`
    //   You touched or clicked: 
    //   - uT is... ${upTime}
    //   - dT is... ${downTime}
    //   - uX is... ${upX}
    //   - dX is... ${downX}
    //   - uY is... ${upY}
    //   - dY is... ${downY}
    //   - sT is... ${swipeTime}ms
    //   - sD is... x:${swipe.x} y:${swipe.y} pixels
    // `
    // );
  }

}
