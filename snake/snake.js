angular.module('app.ctrl.Snake', [

])
.controller('app.ctrl.Snake', function($scope, $sce, $document, $timeout, $interval) {
    var game;
    var snake

function start_game() {

    game = Game({ $scope: $scope, $document: $document, $timeout: $timeout, $interval: $interval });
//    snake = game.snake;

//    snake.render();
//    $document
//    $scope.snake_move_up    = function() { snake.move_up(); };
//    $scope.snake_move_down  = function() { snake.move_down(); };
//    $scope.snake_move_left  = function() { snake.move_left(); };
//    $scope.snake_move_right = function() { snake.move_right() };
//    $scope.snake_grow       = function() { snake.grow(5); };

//    $scope.dostuff        = function() { grid.update(1, 1, '<span>Okay!</span>'); };
//    $scope.dootherstuff   = function() { grid.clear(1, 1); };
//    $scope.put_snake_body = function() { grid.update(2, 2, snake.skin); };
//    $scope.render_snake   = function() { snake.render(); };

    $scope.is_game_over = function() {
        console.log(game.game_over.value);
    };

//    game.grid.update(1, 1, '<span class="rock">&nbsp;</span');

}
    $timeout(function() { start_game(); }, 0);
    $scope.restart_game = function() {
        game.game_over.value = true;
        $timeout(function() { start_game(); }, 0);
    };

    $scope.safehtml = function(html) { return $sce.trustAsHtml(html); };
})
;

function Game(args) {
    var $scope    = args.$scope;
    var $document = args.$document;
    var $timeout  = args.$timeout;
//    var $interval = args.$interval;

    var game_over = { value: false };
    var score     = { value: 0 };
    var grid      = Grid({ $scope: $scope, rows: 10, cols: 20 });
    var rock      = Rock({ grid: grid });
    var sound     = Sound();

    var snake = Snake({
        game_over:  game_over,
        grid: grid,
        rock: rock,
        initial_length: 4,

        on_body_overlapping: function() {
            game_over.value = true;
            sound.play('our/sounds/snake-self-bite');
           },
        on_rock_hitting:     function(hit_rock_index) {
            rock.rocks.splice(hit_rock_index, 1);
            score.value += 10;
            snake.grow(1);
            sound.play('our/sounds/rock-hit');
        },
    });

    snake.render();
    spawn_rocks();
    push_snake();

function spawn_rocks() {
    $timeout(function() {
        if (!game_over.value) {
            rock.spawn_rock(
                rand(0, grid.get_rows() - 1),
                rand(0, grid.get_cols() - 1)
            );
            console.log('rock');
            spawn_rocks();
        }
    }, 1000 * rand(1, 2));
}

function push_snake() {
    $timeout(function() {
        if (!game_over.value) {
            snake.continue_forward();
            push_snake();
        }
    }, 100);
}

    controls(
        $document,
        // fuck bind =)
        snake.move_up,   snake.move_down,
        snake.move_left, snake.move_right
    );

    $scope.grid       = grid.grid;
    $scope.score      = score;
    $scope.game_over  = game_over;
    $scope.snake_body = snake.body;

return {
    game_over:    game_over,
    grid:         grid,
    snake:        snake,
//    snake_length: function() { return snake.body.length; },
//    score: score,
}};


function Grid(args) {
    var $scope = args.$scope;
    var rows   = args.rows || 8;
    var cols   = args.cols || 2 * rows;

    var grid = make_grid();

function make_grid() {
    return _
    .range(1, 1+rows)
    .map(function(row) {
        return _
        .range(1, 1+cols)
        .map(function(col) {
//            return [
//                '<span>',
//                row - 1,
//                ',',
//                col - 1,
//                '</span>'
//            ].join('')
//            ;
            return '<span class="empty">&nbsp</span>';
        })
    })
    ;
};

function update(row, col, html_string) {
    $scope.$apply(function() {
        grid[row][col] = html_string;
    });
};

function clear(row, col) {
    $scope.$apply(function() {
        grid[row][col] = '<span class="empty">&nbsp;</span>';
    });
};

return {
    grid:     grid,
    update:   update,
    clear:    clear,
    get_rows: function() { return rows; },
    get_cols: function() { return cols; },
};}


function Snake(args) {
    var game_over      = args.game_over;
    var grid           = args.grid;
    var rock           = args.rock;
    var initial_length = args.initial_length;

    var on_body_overlapping = args.on_body_overlapping;
    var on_rock_hitting    = args.on_rock_hitting;

    var head = '<span class="snake-head">&nbsp;</span>';
    var skin = '<span class="snake-body">&nbsp;</span>';
    var body = [
//        { row: 5, col: 5 }, // head
//        { row: 5, col: 6 },
//        { row: 5, col: 7 },
//        { row: 5, col: 8 },
//        { row: 5, col: 9 },
//        { row: 5, col: 10 },
//        { row: 5, col: 11 },
//        { row: 5, col: 12 },
//        { row: 5, col: 13 },
    //    { row: 1, col: 2 },
    //    { row: 1, col: 1 },
    ];
    var dirx = [-1, 0, 1][rand(0, 2)];
    var diry = dirx === 0 ? [-1, 1][rand(0, 1)] : 0;
//    console.log(dirx, diry);

    body = init_body();
//    console.log(body);

    var body_overlaps;

function init_body() {
    var head_row = rand(0 + initial_length, grid.get_rows() - initial_length);
    var head_col = rand(0 + initial_length, grid.get_cols() - initial_length);
//    console.log(dirx, diry);
//    console.log(head_row, head_col);

    var body = _.range(0, initial_length - 1).map(function(n) {
        if (dirx !== 0) {
            return { row: head_row, col: (-dirx) * n + head_col };
        }
        else {
            return { row: (-diry) * n + head_row,  col: head_col };
        }
    });
    body.unshift({ row: head_row, col: head_col });

    return body;
}

function continue_forward() {
    if      (dirx == -1) { move_left();  }
    else if (dirx == +1) { move_right(); }
    else if (diry == -1) { move_up();    }
    else if (diry == +1) { move_down();  }
}

function move_up() {
    dirx = 0; diry = -1;
    move(0, -1);
}
function move_down() {
    dirx = 0; diry = 1;
    move(0, 1);
}
function move_left() {
    dirx = -1; diry = 0;
    move(-1, 0);
}
function move_right() {
    dirx = 1; diry = 0;
    move(1, 0);
}

function move(col_delta, row_delta) {
    if (game_over.value) { return; }
    var i;

//    console.log(body);
    var head = { row: body[0].row, col: body[0].col };
    // new head row/col
    var nhr  = head.row + row_delta;
    var nhc  = head.col + col_delta;

    var rows = grid.get_rows();
    var cols = grid.get_cols();
    if (nhr < 0) {
        console.log('leaving from top');
        nhr = rows - 1;
    }
    else if (nhr >= rows) {
        console.log('leaving from bottom');
        nhr = 0;
    }
    else if (nhc < 0) {
        console.log('leaving from left');
        nhc = cols - 1;
    }
    else if (nhc >= cols) {
        console.log('leaving from right');
        nhc = 0;
    }
    else if (body[1].row == nhr && body[1].col == nhc) {
        console.log('going backwards');
        if      (dirx == 0) { diry = -diry; }
        else if (diry == 0) { dirx = -dirx; }
        return;
    }
    head.row = nhr;
    head.col = nhc;


    body_overlaps = _.any(body, function(bp) {
        return bp.row == head.row && bp.col == head.col;
    });
    if (body_overlaps) {
        console.log('body overlaps');
        call_func(on_body_overlapping);
    }

    var hit_rock_index = _.findIndex(rock.rocks, function(r) {
        return r.row == head.row && r.col == head.col;
    });
    if (hit_rock_index != -1) {
        call_func([on_rock_hitting, hit_rock_index]);
    }


    var cell_after_tail = body[body.length - 1];

    for (i = body.length - 1; i >= 1; i--) {
        body[i] = body[i - 1];
    }
    body[0] = head;

    grid.clear(cell_after_tail.row, cell_after_tail.col);

    render();

//    var cell_after_tail = body[body.length - 1];
//    for (i = 0; i < body.length - 1; i++) {
//        body[i + 1] = body[i];
//    }
//    body.unshift(head);
//    body.pop();
//    grid.clear(cell_after_tail.row, cell_after_tail.col);
}

function render() {
    _.chain(_.range(0, body.length).reverse())
    .forEach(function(index) {
    if (index == 0) {
        grid.update(body[index].row, body[index].col, head);
    }
    else {
        grid.update(body[index].row, body[index].col, skin);
    }
    });
}

function grow(by) {
    by = by || 1;
    var head = body[0];
    _.forEach(_.range(0, by), function() {
        body.splice(0, 0, { row: head.row, col: head.col });
    });
//    console.log(body);
};

return {
    skin:          skin,
    body:          body,
    render:        render,
    move_up:       move_up,
    move_down:     move_down,
    move_left:     move_left,
    move_right:    move_right,
    body_overlaps: function () { return body_overlaps; },
    grow:          grow,
    continue_forward:  continue_forward,
};}


function Rock(args) {
    var grid  = args.grid;
    var rock  = '<span class="rock">&nbsp;</span>';
    var rocks = [
//        { row: 7, col: 7 },
    ];

function spawn_rock(row, col) {
    rocks.push({ row: row, col: col });
    grid.update(row, col, rock);
}

return {
rocks: rocks,
spawn_rock: spawn_rock,
};}


function Sound() {
    var mute = false;

function play(sound_filepath) {
    if (mute) { return; }
    new Howl({
        urls: [sound_filepath + '.mp3', sound_filepath + '.ogg'],
        volume: 0.7,
    }).play();
}

return {
play: play,
mute: function(val) { mute = val; },
};}


function controls($document, on_arrow_up, on_arrow_down, on_arrow_left, on_arrow_right) {
    var ARROW_UP    = 38;
    var ARROW_DOWN  = 40;
    var ARROW_LEFT  = 37;
    var ARROW_RIGHT = 39;

    $document[0].onkeydown = function($event) {
        var key = $event.keyCode;
        if      (key == ARROW_UP)    { on_arrow_up();    }
        else if (key == ARROW_DOWN)  { on_arrow_down();  }
        else if (key == ARROW_LEFT)  { on_arrow_left();  }
        else if (key == ARROW_RIGHT) { on_arrow_right(); }
    };
}

function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function call_func(f) {
    if      (f instanceof Function) { f(); }
    else if (f instanceof Array) {
        f[0].apply(null, f.slice(1));
    };
}
