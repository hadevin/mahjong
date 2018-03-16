
Mahjong = new Phaser.Class({
  
  Extends: Phaser.Scene,

  initialize: function Mahjong () {
    Phaser.Scene.call(this, { key: 'mahjong' })

    this.layoutMap =  '001111111111111111111111110000;'+
                      '001111111111111111111111110000;'+
                      '000000112222222222221100000000;'+
                      '000000112222222222221100000000;'+
                      '000011112233333333221111000000;'+
                      '000011112233333333221111000000;'+
                      '001111112233444433221111110000;'+
                      '111111112233455433221111111111;'+
                      '111111112233455433221111111111;'+
                      '001111112233444433221111110000;'+
                      '000011112233333333221111000000;'+
                      '000011112233333333221111000000;'+
                      '000000112222222222221100000000;'+
                      '000000112222222222221100000000;'+
                      '001111111111111111111111110000;'+
                      '001111111111111111111111110000;'
    this.tiles = []
    this.tileWidth = 48
    this.tileHeight = 66
    this.offX = 6  //
    this.offY = 7 //z offset
    this.temptile = []
  },

  preload: function() {
    this.load.spritesheet('tilesheet', 'assets/tiles.png', { frameWidth: this.tileWidth, frameHeight: this.tileHeight })
    this.load.image('background', 'assets/background.png')
  },
  
  create: function() {
    this.add.image(858/2, 570/2, 'background')
    
    const layout = this.layoutMap.split(';').map(s => s.trim().split('').map(c => +c ? +c : -1)).filter(r => r.length != 0)
    const maxLayer = Math.max(...[].concat(...layout));
    
    //optimized for 144 tiles. todo: have it derive from the number of tiles in the layout
    let deck = []
    for(let i = 0; i < 42;i++) {
      deck.push(i)
      deck.push(i)
    }
    for(let i = 0; i < 30;i++) {
      deck.push(i)
      deck.push(i)
    }
    Phaser.Utils.Array.Shuffle(deck)
    
    let idCounter = 0
    let l = [...layout]
    let blockOffs = [[0,0],[1,0],[0,1],[1,1]]
    for(let layer = maxLayer; layer > 0; layer--) {
      for(let row = 0; row < layout.length - 1; row++) {
        for(let col = 0; col < layout[row].length - 1; col++) {
          let isBlock = blockOffs.every((x) => l[row + x[0]][col + x[1]] == layer)
          if(isBlock) {
            let posX = 0.5 * col * (this.tileWidth-this.offX) + this.tileWidth + layer*this.offX
            let posY = 0.5 * row * (this.tileHeight-this.offY) + this.tileHeight  - layer*this.offY
            let tile = this.add.image(posX, posY, 'tilesheet', deck[idCounter]).setInteractive()
            tile.setData('x', col)
            tile.setData('y', row)
            tile.setData('z', layer)
            tile.setData('isSelected', false)
            tile.setDepth(((row+layout.length*2) - col) * (layer+1)) //???
            this.tiles.push(tile)

            blockOffs.every((item) => l[row + item[0]][col + item[1]]--)
            idCounter++
          }
        }
      }
    }
    
    this.input.on('gameobjectdown', function(pointer, gameObject) {
      let row = []
      for(let i = -1; i <= 1; i++) {
        row = [...row, ...this.tiles.filter(item => item.getData('y') == gameObject.getData('y')+i)]
      }
      let left = row.filter(item => item.getData('x') == gameObject.getData('x')-2 && item.getData('z') == gameObject.getData('z'))
      let right = row.filter(item => item.getData('x') == gameObject.getData('x')+2 && item.getData('z') == gameObject.getData('z'))
      let top = []
      for(let i = -1; i <= 1; i++) {
        top = [...top, ...row.filter(item => item.getData('x') == gameObject.getData('x')+i && item.getData('z') == gameObject.getData('z')+1)]
      }
      
      if(top.length == 0 && (left.length == 0 || right.length == 0)) {
        gameObject.setTint(0xaaaaff)
        if(this.temptile.length == 0) {
          gameObject.setData('isSelected', true)
          this.temptile.push(gameObject)
        } else {
          if(this.temptile[0].frame == gameObject.frame && gameObject.getData('isSelected') == false) {
            this.temptile[0].destroy()
            gameObject.destroy()
          }
          this.temptile[0].clearTint()
          gameObject.setData('isSelected', false)
          this.temptile.pop()
          gameObject.clearTint()
        }
      }
    }, this)
  }
});


var config = {
  type: Phaser.WEBGL,
  width: 858,
  height: 570,
  scene: [ Mahjong ]
};

var game = new Phaser.Game(config);