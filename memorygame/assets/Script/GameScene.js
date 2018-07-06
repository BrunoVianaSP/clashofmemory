// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {

        hiddenCards: [], // which card objects have been hidden
        gridSize: { x: 4, y: 2 }, // how many cells in the grid
        cellSize: { x: 150, y: 200 }, // the size of each cell
        indices: [0, 0, 1, 1, 2, 2, 3, 3], // the indices of the cards on the grid (4 pairs)
        numMatches: 0 // the number of matches made since the start of the game

        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        wade.loadImage('images/back.png');
        wade.loadImage('images/0.png');
        wade.loadImage('images/1.png');
        wade.loadImage('images/2.png');
        wade.loadImage('images/3.png');
        wade.loadImage('images/bg.jpg');
        wade.loadImage('images/sparkle.png');
        wade.preloadAudio('sounds/right.ogg');
        wade.preloadAudio('sounds/wrong.ogg');
    },

    start() {
        wade.setMinScreenSize(708, 398); // scale down below this resolution
        wade.setMaxScreenSize(708, 398); // scale up above this resolution

        // initialize the number of successful matches
        numMatches = 0;

        // scramble the card indices
        for (var k = 0; k < 10; k++) {
            var a = Math.floor(Math.random() * indices.length);
            var b = Math.floor(Math.random() * indices.length);
            var temp = indices[a];
            indices[a] = indices[b];
            indices[b] = temp;
        }

        // create cards (adding a delay after each card is created)
        var delay = 0;
        for (var col = 0; col < gridSize.y; col++) {
            for (var row = 0; row < gridSize.x; row++) {
                this.createCard(row, col, delay);
                delay += 150;
            }
        }

        // create a background picture
        var bgSprite = new Sprite('images/bg.jpg', 10);
        var background = new SceneObject(bgSprite);
        wade.addSceneObject(background);
        bgSprite.pushToBack();
    },

    createCard = function(col, row, delay) {
        // delay the execution of the following code
        setTimeout(function() {
            // create card object
            var x = (col - gridSize.x / 2 + 0.5) * cellSize.x;
            var y = (row - gridSize.y / 2 + 0.5) * cellSize.y;
            var sprite = new Sprite('images/back.png', 5);
            var card = new SceneObject(sprite, 0, x, y);
            wade.addSceneObject(card);

            // create an animal object for each card
            var index = indices[col + row * gridSize.x];
            var animalSprite = new Sprite('images/' + index + '.png', 10);
            var animal = new SceneObject(animalSprite, 0, x, y);
            card.animalIndex = index;

            // what happens when the card is clicked
            card.onMouseUp = function() {
                if (hiddenCards.length == 0) // no cards currently hidden
                {
                    // hide the current card
                    this.setVisible(false);
                    hiddenCards.push(this);
                } else if (hiddenCards.length == 1) // there is 1 card currently hidden
                {
                    // hide the current card
                    this.setVisible(false);
                    hiddenCards.push(this);

                    // see if it matches the card that was already hidden
                    if (hiddenCards[0].animalIndex == hiddenCards[1].animalIndex) {
                        for (var col = 0; col < 5; col++) {
                            wade.app.createParticle(hiddenCards[0].getPosition());
                            wade.app.createParticle(hiddenCards[1].getPosition());
                        }
                        hiddenCards.length = 0;
                        wade.playAudioIfAvailable('sounds/right.ogg');
                        if (++numMatches == 4) {
                            setTimeout(function() {
                                wade.clearScene();
                                wade.app.init();
                            }, 2000);
                        }
                    } else {
                        // no match, so show both cards again
                        wade.playAudioIfAvailable('sounds/wrong.ogg');
                        setTimeout(function() {
                            hiddenCards[0].setVisible(true);
                            hiddenCards[1].setVisible(true);
                            hiddenCards.length = 0;
                        }, 1000);
                    }
                }
            };

            // listen for the onMouseUp event
            wade.addEventListener(card, 'onMouseUp');

            // change the draw function of the card sprite to make it fade in, add the animal object to the scene when the fade-in is complete
            sprite.setDrawFunction(wade.drawFunctions.fadeOpacity_(0, 1, 0.5, sprite.draw, function() {
                wade.addSceneObject(animal);
            }));
        }, delay);
    },

    createParticle = function(position) {
        // // create an object that contains a sprite with an animation, then play the animation
        // var animation = new Animation('images/sparkle.png', 8, 4, 30);
        // var size = Math.random() * 40 + 20;
        // var sprite = new Sprite();
        // sprite.setSize(size, size);
        // sprite.addAnimation('sparkle', animation);
        // var particle = new SceneObject(sprite, 0, position.x, position.y);
        // wade.addSceneObject(particle);
        // particle.playAnimation('sparkle');

        // // choose a random speed and direction to move the particle
        // var speed = Math.random() * 50 + 20;
        // var direction = {x: Math.random() * 2 - 1, y: Math.random() * 2 - 1};
        // var length = Math.max(Math.sqrt(direction.x * direction.x + direction.y * direction.y), 0.0001);
        // direction.x /= length;
        // direction.y /= length;
        // particle.moveTo(position.x + direction.x * 1000, position.y + direction.y * 1000, speed);

        // // when the animation of the particle is finished playing, remove the object
        // particle.onAnimationEnd = function()
        // {
        //     wade.removeSceneObject(this);
        // }
    }


    // update (dt) {},
});